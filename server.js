var appHandler = require('./apphandler')
var https = require('https');
var fs = require('fs');

var data = fs.readFileSync('./config/config.json'),configuration;


try {
    configuration = JSON.parse(data);
}
    catch (err) {
    console.log('There has been an error parsing your JSON.')
    console.log(err);
}

var options = {
    key:    fs.readFileSync(configuration.sslkey),
    cert:   fs.readFileSync(configuration.sslcrt),
};






var app = https.createServer(options,appHandler);
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
    if (err) console.log(err);
});


var userHandler = require('./userHandler');
var infoHandler = require('./infoHandler');



allSockets.on('connection', function (socket) {
    userHandler.socketHandler(io,db,socket);
    infoHandler.socketHandler(io,db,socket,userHandler);






});


