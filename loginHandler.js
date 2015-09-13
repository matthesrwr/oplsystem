var db;
var status = {
	userCount:0,
	state:false
};
var users = [];
var logger;
var bcrypt = require('bcrypt');
module.exports = {
	socketHandler: function(loggerSystem,allSockets,dataBase,socket){
		db = dataBase;
		logger = loggerSystem;
	    var count = register(socket.id);
	    // Let all sockets know how many are connected
	    allSockets.emit('users connected', count);
	    socket.on('disconnect', function() {
	        var count = unregister(socket.id);
	        allSockets.emit('users connected', count);
	    });
	    socket.on('login',function(data){
	        login(socket.id,data.user,data.pass,function(err){
	            if(err == 0){
	            	logger.log('info','user ' + data.user + ' logged in');
	            	var status = loginStatus(socket.id);
	            	socket.emit('loginStatus',status);
	            }else{
	            	logger.log('warn','login failed, reason: ' + err);
	            }
	        });
	    });
	    socket.on('logout',function(){
	        logout(socket.id,function(err){
	            if(err == 0){
	            	var status = loginStatus(socket.id);
	                socket.emit('loginStatus',status);
	            }else{
	            	logger.log('warn','logout failed, reason: ' + err);
	            }
	        });
	    });
	    socket.on('loginStatus',function(){
	        socket.emit('loginStatus',loginStatus(socket.id));
	    });
	},
	loggedIn: function(userID){
		var idx = -1;
		users.forEach(function(data,index,array){
			if(data.userID == userID){
				idx = index;
			}
		});
		if(idx < 0){
			return false;
		}
		return users[idx].loggedIn;
	},
	userLevel: function(userID,level){
		var idx = -1;
		users.forEach(function(data,index,array){
			if(data.userID == userID){
				idx = index;
			}
		});
		if(idx < 0){
			return false;
		}
		var levels = ['noright' , 'view' , 'edit' , 'add' , 'master' , 'admin' , 'root'];
		logger.log('info', 'userLevel: ' + users[idx].level + ' requiered level: ' + levels.indexOf(level));
		if(users[idx].level >= levels.indexOf(level)){
			return true;
		}else{
			return false;
		}
	}

};

var login = function(userID,user,pass,callback){
	var idx = -1;
	var error = 0; //errorCodes: 0 all fine; 1 no socket User; 2 no dbEntry; 3 db Error; 4 password invalid; 5 hashError
	users.forEach(function(data,index,array){
		if(data.userID === userID){
			idx = index;
		}
	});
	if(idx < 0){
		error = 1;
		callback(error);
		return;
	}else{
		var dbData;
		var dataPresent = false;
		users[idx].user = user;
		users[idx].loggedIn = false;
		users[idx].level = 0;
		db.query('SELECT id,name,password,level FROM user WHERE name = (?)', user)
	        .on('result', function(data){
	            dbData = data;
	            dataPresent = true;
	        })
	        .on('end', function(){
	            if(dataPresent === true){
	            	bcrypt.compare(pass, dbData.password, function(err, res) {
					    if (!err) {
					        // wenn kein Fehler aufgetreten ist
					        if (res === true) {
			                	users[idx].loggedIn = true;
			                	users[idx].level = dbData.level;
			                	callback(error);
			                	return;
					        } else {
					        	error = 4;
	        					logger.log('error',res);
	        					callback(error);
	        					return;
					        }
					    } else {
	        				logger.log('error',err);
	        				error = 5;
	        				callback(error);
	        				return;
					    }
					});
	            } else {
	            	error = 2;
	            	callback(error);
	            	return;

	            }
	        })
	        .on('error',function(err){
	        	logger.log('error',err);
	        	error = 3;
				callback(error);
				return;
			});

	}
};

var logout = function(userID,callback){
	var idx = -1;
	var error = 0; // 1 no valid user
	users.forEach(function(data,index,array){
		if(data.userID == userID){
			idx = index;
		}
	});
	if(idx < 0){
		error = 1;
	}else{
		users[idx].loggedIn = false;
	}
	callback(error);
};
var loginStatus = function(userID){
	var idx = -1;
	users.forEach(function(data,index,array){
		if(data.userID === userID){
			idx = index;
		}
	});
	if(idx < 0){
		return false;
	}
	return users[idx];
};
var register = function(userID){
	status.userCount++;

	var user = {userID:userID,user:'',loggedIn:false};
	users.push(user);
	return status.userCount;
};
var unregister = function(userID){
	var idx = -1;
	users.forEach(function(data,index,array){
		if(data.userID === userID){
			idx = index;
		}
	});
	users.splice(idx,1);
	status.userCount--;

	return status.userCount;
};