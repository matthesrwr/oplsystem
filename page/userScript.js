var userData;
var groupData;

var userFunction = function(socket){

    // Initial set of notes, loop through and add to list
    socket.on('users.send', function(data){
        userData = data.users;
        groupData = data.groups;
        var html = '<br><table>';
        html += '<tr><td>name</td><td>level</td><td>group</td><td>password</td><td></td></tr>';
        for (var i = 0; i < userData.length; i++){
            // We store html as a var then add to DOM after for efficiency
            html += '<tr class=users.entry id=' + i + '><td>' + userData[i].name + '</td>';
            html += '<td>' + userData[i].level + '</td>';
            var groupName = 'none';
            groupData.forEach(function(data,index,array){
                if(data.id === userData[i].groupID){
                    groupName = data.name;
                }
            });
            html += '<td>' + groupName + '</td>';
            html += '<td></td></tr>';
        }
        html += '<tr><td><input id=users.newName></input></td>';
        html += '<td><input id=users.newLevel></input></td>';
        html += '<td><select id=users.newGroup>';
        groupData.forEach(function(data,index,array){
            html += '<option value=' + data.id + '>' + data.name + '</input>';
        });

        html += '</select></td>';
        html += '<td><input id=users.newPassword></input></td>';
        html += '<td><input id=users.newSubmit type=submit></input></td></tr>';
        html += '</table><br>';
        $('#bodyDiv').html(html);
        userFormFunctions(socket);
        $('#user').focus();
        // Add a new (random) note, emit to server to let others know
    });
    socket.on('users.added',function(){
        socket.emit('users.get');
    });
    socket.on('users.modified',function(){
        socket.emit('users.get');
    });
    socket.on('users.deleted',function(){
        socket.emit('users.get');
    });

    $('#headDiv').append('<span id=users.head class="headElement">Users</span>');
    $('#users\\.head').click(function(){
        socket.emit('users.get');
    });
};

var userFormFunctions = function(socket){
    $('#users\\.newName').keypress(function(e){
        if(e.which == 13){
            userAddFunction(socket);
        }
    });
    $('#users\\.newPassword').keypress(function(e){
        if(e.which == 13){
            userAddFunction(socket);
        }
    });
    $('#users\\.newLevel').keypress(function(e){
        if(e.which == 13){
            userAddFunction(socket);
        }
    });
    $('#users\\.newSubmit').click(function(){
            userAddFunction(socket);
    });
    $('.users\\.entry').click(function(){
        var html = '<td><input id=users.changeUser value=' + userData[this.id].name + '></input></td>';
        html += '<td><input id=users.changeLevel value=' + userData[this.id].level + '></input></td>';
        var actID = this.id;
        html += '<td><select id=users.changeGroup>';
        groupData.forEach(function(data,index,array){
            if(userData[actID].groupID === data.id){
                html += '<option selected value=' + data.id + '>' + data.name + '</input>';
            }else{
                html += '<option value=' + data.id + '>' + data.name + '</input>';
            }
        });
        html += '</select></td>';



        html += '<td><input id=users.changeSubmit type=submit value=change class=' + this.id + '></input>';
        html += '<input id=users.deleteSubmit type=submit value=delete class=' + this.id + '></input></td>'
        $('#' + this.id).html(html);
        $('.users\\.entry').unbind();
        $('#users\\.deleteSubmit').click(function(){
            var id=$('#users\\.deleteSubmit').attr('class');
            socket.emit('users.delete',{id:userData[id].id});
        });
        $('#users\\.changeSubmit').click(function(){
            var modUser = {};
            modUser.id=userData[$('#users\\.changeSubmit').attr('class')].id;
            modUser.name = $('#users\\.changeUser').val();
            modUser.level = $('#users\\.changeLevel').val();
            modUser.groupID = $('#users\\.changeGroup').val();
            socket.emit('users.modify',{id:modUser.id,name:modUser.name,level:modUser.level,groupID:modUser.groupID});
        });
    });

};


var userAddFunction = function(socket){
    var newUser = {};
    newUser.name = $('#users\\.newName').val();
    newUser.password = $('#users\\.newPassword').val();
    newUser.level = $('#users\\.newLevel').val();
    newUser.groupID = $('#users\\.newGroup').val();
    socket.emit('users.new',{name:newUser.name,password:newUser.password,level:newUser.level,groupID:newUser.groupID});
    $('#users\\.newName').focus();
    return false;
}