
var db;
var logger;
var bcrypt = require('bcrypt');
module.exports = {
	socketHandler:function(loggerSystem,allSockets,dataBase,socket,loginHandler){
		db = dataBase;
		logger = loggerSystem;
	    socket.on('get users',function(data){
	        if(loginHandler.userLevel(socket.id,'master') == false)
	        {
	            return;
	        }
	        readUsers(function(data){
	            var users = data;
	            logger.log('info','users send');
	            socket.emit('users',users);
	        });
	    });

	    socket.on('new user', function(data){
			logger.log('info',data)
	        // New note added, push to all sockets and insert into db
	        if(loginHandler.userLevel(socket.id,'master') == false)
	        {
	            return;
	        }
	        writeUser(data.user, function(){
	        	logger.log('info', 'user created')
	        	allSockets.emit('userAdded');
	        });
	    });
	    socket.on('del user', function(data){
	        // New note added, push to all sockets and insert into db
	        if(loginHandler.userLevel(socket.id,'admin') == false)
	        {
	            return;
	        }
	        delUser(data.id, function(){
	        	logger.log('info', 'user deleted')
	        	allSockets.emit('userDeleted');
	        });
	    });
	    socket.on('change user', function(data){
	        // New note added, push to all sockets and insert into db
	        if(loginHandler.userLevel(socket.id,'admin') == false)
	        {
	            return;
	        }
	        changeUser(data, function(){
	        	logger.log('info', 'user modified')
	        	allSockets.emit('userModified');
	        });
	    });
	}
};

var writeUser = function(data,callback){
	bcrypt.hash(data.password, 10, function(err, hash) {
	    if (!err) {
	    	logger.log('info', 'new hash: ' + hash);
			db.query('INSERT INTO user SET ?', {name : data.name,password : hash,level : data.level})
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
	var users = [];
	db.query('SELECT id,name,level FROM user')
        .on('result', function(data){
            // Push results onto the notes array
            users.push(data);
        })
        .on('end', function(){
            // Only emit notes after query has been completed
            callback(users);
        })
        .on('error',function(err){
		logger.log('error',err);		});
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
	db.query('UPDATE user SET ? WHERE id=?', [{name:data.name,level:data.level},data.id])
		.on('end',function(){
			callback();
		})
		.on('error',function(err){
			logger.log('error',err);
		});
};
