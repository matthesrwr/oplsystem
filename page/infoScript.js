var infoFunction = function(socket){

    // Initial set of notes, loop through and add to list
    socket.on('infos', function(data){
        var html = '<ul>';
        for (var i = 0; i < data.length; i++){
            // We store html as a var then add to DOM after for efficiency
            html += '<li class=entry id=' + data[i].id + '>' + data[i].text + '</li>';
        }
        html += '</ul>';
        html += '<input id=info></input><input id=submit type=submit></input>';
        $('#bodyDiv').html(html);
        noteFormFunctions(socket);
        $('#info').focus();
        // Add a new (random) note, emit to server to let others know
    });
    socket.on('infoWriten',function(){
        socket.emit('get infos',{type:'onWrite'});
    });
    socket.on('infoDeleted',function(){
        socket.emit('get infos',{type:'onDel'});
    });

    $('#headDiv').append('<span id=headInfo class="headElement">Infos</span>');
    $('#headInfo').click(function(){
        socket.emit('get infos',{type:'onload'});
    });
};

var noteFormFunctions = function(socket){
    $('#info').keypress(function(e){
        if(e.which == 13){
            var iInfo = $('#info').val();
            socket.emit('new info',{info:iInfo});
            $('#info').focus();
            return false;
        }
    });
    $('#submit').click(function(){
        var iInfo = $('#info').val();
        socket.emit('new info',{info:iInfo});
        $('#info').focus();
        return false;
    });
    $('.entry').click(function(){
        socket.emit('del info',{id:this.id});
    });
};