var userData;


var userFunction = function(socket){

    // Initial set of notes, loop through and add to list
    socket.on('users', function(data){
        userData = data;
        var html = '<br><table>';
        html += '<tr><td>Name</td><td>Level</td><td></td></tr>';
        for (var i = 0; i < data.length; i++){
            // We store html as a var then add to DOM after for efficiency
            html += '<tr class=entry id=' + i + '><td>' + data[i].name + '</td>';
            html += '<td>' + data[i].level + '</td>';
            html += '<td></td></tr>';
        }
        html += '</table><br>';
        html += '<input id=username></input><input id=password></input><input id=level></input><input id=submit type=submit></input>';
        $('#bodyDiv').html(html);
        userFormFunctions(socket);
        $('#user').focus();
        // Add a new (random) note, emit to server to let others know
    });
    socket.on('userAdded',function(){
        socket.emit('get users',{type:'onWrite'});
    });
    socket.on('userModified',function(){
        socket.emit('get users',{type:'onModify'});
    });
    socket.on('userDeleted',function(){
        socket.emit('get users',{type:'onDel'});
    });

    $('#headDiv').append('<span id=headUser class="headElement">Users</span>');
    $('#headUser').click(function(){
        socket.emit('get users',{type:'onLoad'});
    });
};

var userFormFunctions = function(socket){
    $('#username').keypress(function(e){
        if(e.which == 13){
            userAddFunction(socket);
        }
    });
    $('#password').keypress(function(e){
        if(e.which == 13){
            userAddFunction(socket);
        }
    });
    $('#level').keypress(function(e){
        if(e.which == 13){
            userAddFunction(socket);
        }
    });
    $('#submit').click(function(){
            userAddFunction(socket);
    });
    $('.entry').click(function(){
        var html = '<td><input id=changeUser value=' + userData[this.id].name + '></input></td>';
        html += '<td><input id=changeLevel value=' + userData[this.id].level + '></input></td>';
        html += '<td><input id=change type=submit value=change class=' + this.id + '></input>';
        html += '<input id=delete type=submit value=delete class=' + this.id + '></input></td>'
        $('#' + this.id).html(html);
        $('.entry').unbind();
        $('#delete').click(function(){
            var id=$('#delete').attr('class');
            socket.emit('del user',{id:userData[id].id});
        });
        $('#change').click(function(){
            var modUser = {};
            modUser.id=userData[$('#change').attr('class')].id;
            modUser.name = $('#changeUser').val();
            modUser.level = $('#changeLevel').val();
            socket.emit('change user',{id:modUser.id,name:modUser.name,level:modUser.level});
        });
    });

};


var userAddFunction = function(socket){
    var iUser = {};
    iUser.name = $('#username').val();
    iUser.password = $('#password').val();
    iUser.level = $('#level').val();
    socket.emit('new user',{user:iUser});
    $('#user').focus();
    return false;
}