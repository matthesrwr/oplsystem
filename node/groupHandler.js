
var db;
var logger;
module.exports = {
	socketHandler:function(loggerSystem,allSockets,dataBase,socket,loginHandler){
		db = dataBase;
		logger = loggerSystem;
	    socket.on('groups.get',function(data){
	        if(loginHandler.userLevel(socket.id,'master') == false)
	        {
	            return;
	        }
	        readGroups(function(data){
	            var groups = data;
	            logger.log('info','groups send');
	            socket.emit('groups.send',groups);
	        });
	    });

	    socket.on('groups.new', function(data){
			logger.log('info',data)
	        // New note added, push to all sockets and insert into db
	        if(loginHandler.userLevel(socket.id,'master') == false)
	        {
	            return;
	        }
	        writeGroup(data, function(){
	        	logger.log('info', 'group created')
	        	allSockets.emit('groups.added');
	        });
	    });
	    socket.on('groups.delete', function(data){
	        // New note added, push to all sockets and insert into db
	        if(loginHandler.userLevel(socket.id,'admin') == false)
	        {
	            return;
	        }
	        delGroup(data.id, function(){
	        	logger.log('info', 'group deleted')
	        	allSockets.emit('groups.deleted');
	        });
	    });
	    socket.on('groups.modify', function(data){
	        // New note added, push to all sockets and insert into db
	        if(loginHandler.userLevel(socket.id,'admin') == false)
	        {
	            return;
	        }
	        changeGroup(data, function(){
	        	logger.log('info', 'group modified')
	        	allSockets.emit('groups.modified');
	        });
	    });
	}
};

var writeGroup = function(data,callback){

	db.query('INSERT INTO groups SET ?', {name : data.name,head : data.head})
		.on('end',function(){
			callback();
		})
		.on('error',function(err){
			logger.log('error',err);
		});
};
var readGroups = function(callback){
	var groups = {};
	groups.groups = [];
	groups.user = [];
	db.query('SELECT id,name,head FROM groups')
        .on('result', function(data){
            // Push results onto the notes array
            groups.groups.push(data);
        })
        .on('end', function(){
            // Only emit notes after query has been completed
			db.query('SELECT id,name FROM user')
		        .on('result', function(data){
		            // Push results onto the notes array
		            groups.user.push(data);
		        })
		        .on('end', function(){
		            // Only emit notes after query has been completed

		            callback(groups);
		        })
		        .on('error',function(err){
					logger.log('error',err);
				});
        })
        .on('error',function(err){
			logger.log('error',err);
		});
};
var delGroup = function(data,callback){
	db.query('DELETE FROM groups WHERE id=(?)', data)
		.on('end',function(){
			callback();
		})
		.on('error',function(err){
			logger.log('error',err);
		});
};
var changeGroup = function(data,callback){
	logger.log('info',data)
	db.query('UPDATE groups SET ? WHERE id=?', [{name:data.name,head:data.head},data.id])
		.on('end',function(){
			callback();
		})
		.on('error',function(err){
			logger.log('error',err);
		});
};
