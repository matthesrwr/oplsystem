var fsHandler = require('fs');
var mimeHandler = require('mime');
var urlHandler = require('url');



module.exports = function (logger,request, response,filePath) {
	switch(request.method){
		case "GET" :
			var fileName = urlHandler.parse(request.url).pathname;
			fileName = fileName.replace("../","");
			if(fileName == "/"){
				fileName = '/index.html';
			}

			//var extName = pathHandler.extname(fileName);
			var contentMime = mimeHandler.lookup(filePath + fileName);
			logger.log('debug' , 'request for: ' + request.url);



			fsHandler.readFile(filePath + fileName,function(err,data){
				if(err) {
					response.writeHead(404);
					logger.log('warn','error reading file: ' + err);
					response.end();
					return;
				}else{
					response.writeHead(200, {'Content-Type': contentMime});
				    response.write(data);
					response.end();
					logger.log('debug' , 'send ' + filePath + fileName + " with mime " + contentMime);
				}
			});
		break;
		default :
			response.writeHead(404);
		break;
	};


};