
var db;
var logger;
var bcrypt = require('bcrypt');
module.exports = {
	socketHandler:function(loggerSystem,allSockets,dataBase,socket,loginHandler){
		db = dataBase;
		logger = loggerSystem;
	    socket.on('users.get',function(data){
	        if(loginHandler.userLevel(socket.id,'master') == false)
	        {
	            return;
	        }
	        readUsers(function(data){
	            var users = data;
	            logger.log('debug','users send');
	            logger.log('debug',users);
	            socket.emit('users.send',users);
	        });
	    });

	    socket.on('users.new', function(data){
			logger.log('info',data)
	        // New note added, push to all sockets and insert into db
	        if(loginHandler.userLevel(socket.id,'master') == false)
	        {
	            return;
	        }
	        writeUser(data, function(){
	        	logger.log('debug', 'user created')
	        	allSockets.emit('users.added');
	        });
	    });
	    socket.on('users.delete', function(data){
	        // New note added, push to all sockets and insert into db
	        if(loginHandler.userLevel(socket.id,'admin') == false)
	        {
	            return;
	        }
	        delUser(data.id, function(){
	        	logger.log('debug', 'user deleted')
	        	allSockets.emit('users.deleted');
	        });
	    });
	    socket.on('users.modify', function(data){
	        // New note added, push to all sockets and insert into db
	        if(loginHandler.userLevel(socket.id,'admin') == false)
	        {
	            return;
	        }
	        changeUser(data, function(){
	        	logger.log('debug', 'user modified')
	        	allSockets.emit('users.modified');
	        });
	    });
	}
};

var writeUser = function(data,callback){
	bcrypt.hash(data.password, 10, function(err, hash) {
	    if (!err) {
	    	logger.log('debug', 'new hash: ' + hash);
			db.query('INSERT INTO user SET ?', {name : data.name,password : hash,level : data.level, groupID : data.groupID})
				.on('end',function(){
					callback();
				})
				.on('error',function(err){
					logger.log('error',err);
				});

	    } else {
			logger.log('error',err);
	    }
	});
};
var readUsers = function(callback){
	var users = {};
	users.users = [];
	users.groups = [];
	db.query('SELECT id,name,level,groupID FROM user')
        .on('result', function(data){
            // Push results onto the notes array
            users.users.push(data);
        })
        .on('end', function(){
            // Only emit notes after query has been completed
            db.query('SELECT id,name FROM groups')
		        .on('result', function(data){
		            // Push results onto the notes array
		            users.groups.push(data);
		        })
		        .on('end', function(){
		            // Only emit notes after query has been completed
		            callback(users);
		        })
		        .on('error',function(err){
					logger.log('error',err);
				});
        })
        .on('error',function(err){
			logger.log('error',err);
		});
};
var delUser = function(data,callback){
	db.query('DELETE FROM user WHERE id=(?)', data)
		.on('end',function(){
			callback();
		})
		.on('error',function(err){
			logger.log('error',err);
		});
};
var changeUser = function(data,callback){
	logger.log('info',data)
	db.query('UPDATE user SET ? WHERE id=?', [{name:data.name,level:data.level,groupID:data.groupID},data.id])
		.on('end',function(){
			callback();
		})
		.on('error',function(err){
			logger.log('error',err);
		});
};
