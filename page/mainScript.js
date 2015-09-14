$(document).ready(function(){
    // Connect to our node/websockets server
    var socket = io.connect('https://matthesmac:3000');


    loginFunction(socket);

    $(window).on('loginState', function (e,data) {
        if(e.state === true){
            console.log('logged in');
            if(data.level >= 0){
                infoFunction(socket);
            }
            if(data.level >= 4){
                userFunction(socket);
                groupFunction(socket);
            }

        }else{
            $('#bodyDiv').html('');
            $('#headDiv').html('');
        }
    });

});