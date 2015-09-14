var appHandler = require('./node/apphandler');
var logger = require('./node/logHandler');
var https = require('https');
var fs = require('fs');
var appFilePath = __dirname + '/page';


logger.setLevel('debug');

logger.log('info',"read config file");
var configurationFile = fs.readFileSync('./config/config.json');
var configuration = JSON.parse(configurationFile);



var httpOptions = {
    key:    fs.readFileSync(configuration.sslkey),
    cert:   fs.readFileSync(configuration.sslcrt),
};






var app = https.createServer(httpOptions,function(request,response){
    appHandler(logger,request,response,appFilePath);
});
var io = require('socket.io').listen(app);
app.listen(configuration.server.port, configuration.server.hostname);
var allSockets = io.sockets;


var mysql = require('mysql');
var db = mysql.createConnection({
    host: configuration.mysql.server,
    user: configuration.mysql.user,
    password: configuration.mysql.pass,
    database: configuration.mysql.dbname
});
db.connect(function(err){
    if (err) logger.log('error',err);
});


var loginHandler = require('./node/loginHandler');
var userHandler = require('./node/userHandler');
var groupHandler = require('./node/groupHandler');
var projectHandler = require('./node/projectHandler');




var infoHandler = require('./node/infoHandler');
var openpointsHandler = require('./node/openpointsHandler');



allSockets.on('connection', function (socket) {
    loginHandler.socketHandler(logger,io,db,socket);
    userHandler.socketHandler(logger,io,db,socket,loginHandler);
    groupHandler.socketHandler(logger,io,db,socket,loginHandler);
    projectHandler.socketHandler(logger,io,db,socket,loginHandler);


    openpointsHandler.socketHandler(logger,io,db,socket,loginHandler);
    infoHandler.socketHandler(logger,io,db,socket,loginHandler);
});


