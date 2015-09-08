
var db;


module.exports = {
	socketHandler:function(allSockets,dataBase,socket,userHandler){
		db = dataBase;
	    socket.on('get infos',function(data){
	        if(userHandler.loggedIn(socket.id) == false)
	        {
	            return;
	        }
	        readInfos(function(data){
	            var infos = data;
	            socket.emit('infos',infos);
	        });
	    });

	    socket.on('new info', function(data){
	        // New note added, push to all sockets and insert into db
	        if(userHandler.loggedIn(socket.id) == false)
	        {
	            return;
	        }
	        writeInfo(data.info, function(){
	        	allSockets.emit('infoWriten');
	        });
	    });
	    socket.on('del info', function(data){
	        // New note added, push to all sockets and insert into db
	        if(userHandler.loggedIn(socket.id) == false)
	        {
	            return;
	        }
	        delInfo(data.id, function(){
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
		console.log(err);
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
			console.log(err);
		});
};
var delInfo = function(data,callback){
db.query('DELETE FROM infos WHERE id=(?)', data)
	.on('end',function(){
		callback();
	})
	.on('error',function(err){
		console.log(err);
	});
};