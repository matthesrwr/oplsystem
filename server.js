var appHandler = require('./apphandler')
var https = require('https');
var fs = require('fs');

var options = {
    key:    fs.readFileSync('./certs/server.key'),
    cert:   fs.readFileSync('./certs/server.crt'),
};


var app = https.createServer(options,appHandler);
var io = require('socket.io').listen(app);
app.listen(3000, "0.0.0.0");
var allSockets = io.sockets;


var mysql = require('mysql');
var db = mysql.createConnection({
    host: 'localhost',
    user: 'opl',
    password: 'oplpass',
    database: 'opl'
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


