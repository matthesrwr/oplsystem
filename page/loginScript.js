var loginFunction = function(socket){

        // New socket connected, display new count on page
    socket.on('users connected', function(data){
        $('#usersConnected').html('<p>Users connected: ' + data + '</p>');
    });
    var evt = jQuery.Event('loginState');
    evt.state = false;
    $(window).trigger(evt);


    socket.on('loginStatus',function(data){
        if (data.loggedIn == true){
            evt.state = true;
            $(window).trigger(evt,data);
            var html = '<p id=logout><a>logout</a></p>';
            $('#loginDiv').html(html);
            $('#logout').click(function(){
                socket.emit('logout');
            });
        }else{
            evt.state = false;
            evt.data = 0;
            $(window).trigger(evt);
            var html = '<input id=user></input><input id=pass></input><input id=submit type=submit></input>';
            $('#loginDiv').html(html);
            $('#user').focus();
            loginFormFunctions(socket);
        }
    });

    socket.emit('loginStatus');
};
var loginFormFunctions = function(socket){
    $('#user').keypress(function(e){
        if(e.which == 13){
            var iUser = $('#user').val();
            var iPass = $('#pass').val();
            socket.emit('login',{user:iUser,pass:iPass});
            return false;
        }
    });
    $('#pass').keypress(function(e){
        if(e.which == 13){
            var iUser = $('#user').val();
            var iPass = $('#pass').val();
            socket.emit('login',{user:iUser,pass:iPass});
            return false;
        }
    });
    $('#submit').click(function(){
        var iUser = $('#user').val();
        var iPass = $('#pass').val();
        socket.emit('login',{user:iUser,pass:iPass});
        return false;
    });
};