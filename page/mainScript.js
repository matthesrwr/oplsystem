$(document).ready(function(){
    // Connect to our node/websockets server
    var socket = io.connect('https://localhost:3000');


    loginFunction(socket);

    $(window).on('loginState', function (e) {
        if(e.state ==true){
            infoFunction(socket);

        }else{
            $('#bodyDiv').html('');
            $('#headDiv').html('');
        }
    });

});