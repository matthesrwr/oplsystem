var loginFunction = function(socket){

        // New socket connected, display new count on page
    socket.on('login.userCount', function(data){
        $('#usersConnected').html('<p>Users connected: ' + data + '</p>');
    });
    var evt = jQuery.Event('loginState');
    evt.state = false;
    $(window).trigger(evt);


    socket.on('login.serverStatus',function(data){
        if (data.loggedIn == true){
            evt.state = true;
            $(window).trigger(evt,data);
            var html = '<p id=logout><a>logout</a></p>';
            $('#loginDiv').html(html);
            $('#logout').click(function(){
                socket.emit('login.logout');
            });
        }else{
            evt.state = false;
            evt.data = 0;
            $(window).trigger(evt);
            var html = '<input id=user></input><input type=password id=pass></input><input id=submit type=submit></input>';
            $('#loginDiv').html(html);
            $('#user').focus();
            loginFormFunctions(socket);
        }
    });

    socket.emit('login.clientStatus');
};
var loginFormFunctions = function(socket){
    $('#user').keypress(function(e){
        if(e.which == 13){
            loginSendFunction(socket);
            return false;
        }
    });
    $('#pass').keypress(function(e){
        if(e.which == 13){
            loginSendFunction(socket);
            return false;
        }
    });
    $('#submit').click(function(){
        loginSendFunction(socket);
        return false;
    });
};

var loginSendFunction = function(socket){
    var iUser = $('#user').val();
    var iPass = $('#pass').val();
    socket.emit('login.login',{user:iUser,pass:iPass});
}