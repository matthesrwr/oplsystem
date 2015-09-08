var fsHandler = require('fs');
var pathHandler = require('path');
var utilHandler = require('util');
var mimeHandler = require('mime');
var urlHandler = require('url')
var filePath = __dirname + '/page';



module.exports = function (request, response) {
	switch(request.method){
		case "GET" :
			var fileName = urlHandler.parse(request.url).pathname;
			console.log(request.url);
			fileName = fileName.replace("../","");
			if(fileName == "/"){
				fileName = '/index.html';
			}

			//var extName = pathHandler.extname(fileName);
			var contentMime = mimeHandler.lookup(filePath + fileName);
			console.log('request for: ' + request.url);



			fsHandler.readFile(filePath + fileName,function(err,data){
				if(err) {
					response.writeHead(404);
					response.end();
					return;
				}else{
					response.writeHead(200, {'Content-Type': contentMime});
				    response.write(data);
					response.end();
					console.log('send ' + filePath + fileName + " with mime " + contentMime);
				}
			});
		break;
		default :
			response.writeHead(404);
		break;
	};


};