var appHandler = require('./apphandler');
var logger = require('./logHandler');
var https = require('https');
var fs = require('fs');

logger.setLevel('info');

logger.log('info',"read config file");
var data = fs.readFileSync('./config/config.json'),configuration;


try {
    configuration = JSON.parse(data);
}
    catch (err) {
    logger.log('error','There has been an error parsing your JSON.')
    console.log('error',err);
}


var options = {
    key:    fs.readFileSync(configuration.sslkey),
    cert:   fs.readFileSync(configuration.sslcrt),
};






var app = https.createServer(options,function(request,response){
    appHandler(logger,request,response);
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


var loginHandler = require('./loginHandler');
var infoHandler = require('./infoHandler');
var userHandler = require('./userHandler');



allSockets.on('connection', function (socket) {
    loginHandler.socketHandler(logger,io,db,socket);
    infoHandler.socketHandler(logger,io,db,socket,loginHandler);
    userHandler.socketHandler(logger,io,db,socket,loginHandler);
});


