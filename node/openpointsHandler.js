
var db;
var logger;

module.exports = {
	socketHandler:function(loggerSystem,allSockets,dataBase,socket,loginHandler){
		logger = loggerSystem;
		db = dataBase;
	    socket.on('openpoints.get',function(data){
	        if(loginHandler.userLevel(socket.id,'view') == false)
	        {
	            return;
	        }
	        readOpenpoints(data,function(data){
	            var points = data;
	            logger.log('debug','points send');
	            socket.emit('openpoints.send',points);
	        });
	    });

	    socket.on('openpoints.new', function(data){
	        // New note added, push to all sockets and insert into db
	        if(loginHandler.userLevel(socket.id,'add') == false)
	        {
	            return;
	        }
	        writeOpenpoint(data.info, function(){
	        	logger.log('debug', 'points created')
	        	allSockets.emit('openpoints.created');
	        });
	    });
	    socket.on('openpoints.delete', function(data){
	        // New note added, push to all sockets and insert into db
	        if(loginHandler.userLevel(socket.id,'master') == false)
	        {
	            return;
	        }
	        delelteOpenpoint(data.id, function(){
	        	logger.log('degub', 'info deleted')
	        	allSockets.emit('openpoints.deleted');
	        });
	    });

	}
};


var readOpenpoints = function(data,callback){
	var result = {};
	result.openpoints = [];
	result.groups = [];
	result.user = [];
	result.projectData = [];

	db.query('SELECT * FROM openpoints')
        .on('result', function(data){
            // Push results onto the notes array
            result.openpoints.push(data);
        })
        .on('end', function(){
            // Only emit notes after query has been completed
			db.query('SELECT id,name FROM groups')
		        .on('result', function(data){
		            // Push results onto the notes array
		            result.groups.push(data);
		        })
		        .on('end', function(){
		            // Only emit notes after query has been completed
					db.query('SELECT id,name,groupID FROM user')
				        .on('result', function(data){
				            // Push results onto the notes array
				            result.user.push(data);
				        })
				        .on('end', function(){
				            // Only emit notes after query has been completed
						db.query('SELECT id,name FROM project')
					        .on('result', function(data){
					            // Push results onto the notes array
					            result.projectData.push(data);
					        })
					        .on('end', function(){
					            // Only emit notes after query has been completed
					            callback(result);
					        })
					        .on('error',function(err){
								logger.log('error',err);
							});
				        })
				        .on('error',function(err){
							logger.log('error',err);
						});
		        })
		        .on('error',function(err){
					logger.log('error',err);
				});
        })
        .on('error',function(err){
			logger.log('error',err);
		});
};




/*
var writeOpenpoint = function(data,callback){
	db.query('INSERT INTO infos (text) VALUES (?)', data)
		.on('end',function(){
			callback();
		})
		.on('error',function(err){
			logger.log('error',err);
		});
};
var delelteOpenpoint = function(data,callback){
	db.query('DELETE FROM infos WHERE id=(?)', data)
		.on('end',function(){
			callback();
		})
		.on('error',function(err){
			logger.log('error',err);
		});
};


*/