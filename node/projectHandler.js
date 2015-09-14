
var db;
var logger;
module.exports = {
	socketHandler:function(loggerSystem,allSockets,dataBase,socket,loginHandler){
		db = dataBase;
		logger = loggerSystem;
	    socket.on('projects.get',function(data){
	        if(loginHandler.userLevel(socket.id,'master') == false)
	        {
	            return;
	        }
	        readprojects(function(data){
	            var projects = data;
	            logger.log('info','projects send');
	            socket.emit('projects.send',projects);
	        });
	    });

	    socket.on('projects.new', function(data){
			logger.log('info',data)
	        // New note added, push to all sockets and insert into db
	        if(loginHandler.userLevel(socket.id,'master') == false)
	        {
	            return;
	        }
	        writeProject(data, function(){
	        	logger.log('info', 'project created')
	        	allSockets.emit('projects.added');
	        });
	    });
	    socket.on('projects.delete', function(data){
	        // New note added, push to all sockets and insert into db
	        if(loginHandler.userLevel(socket.id,'admin') == false)
	        {
	            return;
	        }
	        delProject(data.id, function(){
	        	logger.log('info', 'project deleted')
	        	allSockets.emit('projects.deleted');
	        });
	    });
	    socket.on('projects.modify', function(data){
	        // New note added, push to all sockets and insert into db
	        if(loginHandler.userLevel(socket.id,'admin') == false)
	        {
	            return;
	        }
	        changeProject(data, function(){
	        	logger.log('info', 'project modified')
	        	allSockets.emit('projects.modified');
	        });
	    });
	}
};

var writeProject = function(data,callback){

	db.query('INSERT INTO project SET ?', {name : data.name,customer:data.customer,type:data.type})
		.on('end',function(){
			callback();
		})
		.on('error',function(err){
			logger.log('error',err);
		});
};
var readprojects = function(callback){
	var projects = {};
	projects.projects = [];
	projects.user = [];
	db.query('SELECT id,name,customer,type FROM project')
        .on('result', function(data){
            // Push results onto the notes array
            projects.projects.push(data);
        })
        .on('end',function(){
        	callback(projects);
        })
        .on('error',function(err){
			logger.log('error',err);
		});
};
var delProject = function(data,callback){
	db.query('DELETE FROM project WHERE id=(?)', data)
		.on('end',function(){
			callback();
		})
		.on('error',function(err){
			logger.log('error',err);
		});
};
var changeProject = function(data,callback){
	logger.log('info',data)
	db.query('UPDATE project SET ? WHERE id=?', [{name:data.name,customer:data.customer,type:data.type},data.id])
		.on('end',function(){
			callback();
		})
		.on('error',function(err){
			logger.log('error',err);
		});
};
