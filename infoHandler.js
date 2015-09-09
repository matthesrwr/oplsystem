
var db;
var logger

module.exports = {
	socketHandler:function(loggerSystem,allSockets,dataBase,socket,loginHandler){
		logger = loggerSystem;
		db = dataBase;
	    socket.on('get infos',function(data){
	        if(loginHandler.userLevel(socket.id,'view') == false)
	        {
	            return;
	        }
	        readInfos(function(data){
	            var infos = data;
	            logger.log('info','infos send');
	            socket.emit('infos',infos);
	        });
	    });

	    socket.on('new info', function(data){
	        // New note added, push to all sockets and insert into db
	        if(loginHandler.userLevel(socket.id,'add') == false)
	        {
	            return;
	        }
	        writeInfo(data.info, function(){
	        	logger.log('info', 'info created')
	        	allSockets.emit('infoWriten');
	        });
	    });
	    socket.on('del info', function(data){
	        // New note added, push to all sockets and insert into db
	        if(loginHandler.userLevel(socket.id,'master') == false)
	        {
	            return;
	        }
	        delInfo(data.id, function(){
	        	logger.log('info', 'info deleted')
	        	allSockets.emit('infoDeleted');
	        });
	    });
	}
};

var writeInfo = function(data,callback){
db.query('INSERT INTO infos (text) VALUES (?)', data)
	.on('end',function(){
		callback();
	})
	.on('error',function(err){
		logger.log('error',err);
	});
};
var readInfos = function(callback){
	var infos = [];
	db.query('SELECT id,text FROM infos')
        .on('result', function(data){
            // Push results onto the notes array
            infos.push(data);
        })
        .on('end', function(){
            // Only emit notes after query has been completed
            callback(infos);
        })
        .on('error',function(err){
		logger.log('error',err);		});
};
var delInfo = function(data,callback){
db.query('DELETE FROM infos WHERE id=(?)', data)
	.on('end',function(){
		callback();
	})
	.on('error',function(err){
		logger.log('error',err);
	});
};