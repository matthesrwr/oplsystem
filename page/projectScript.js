var projectData;

var projectFunction = function(socket){

    // Initial set of notes, loop through and add to list
    socket.on('projects.send', function(data){
        projectData = data.projects;
        userData = data.user;
        var html = '<br><table>';
        html += '<tr><td>Name</td><td>customer</td><td>type</td><td></td></tr>';
        for (var i = 0; i < projectData.length; i++){
            // We store html as a var then add to DOM after for efficiency
            html += '<tr class=projects.entry id=' + i + '><td>' + projectData[i].name + '</td>';
            html += '<td>' + projectData[i].customer + '</td>';
            html += '<td>' + projectData[i].type + '</td>';
            html += '<td></td></tr>';
        }
        html += '<tr><td><input id=projects.newName></input></td>';
        html += '<td><input id=projects.newCustomer></input></td>';
        html += '<td><input id=projects.newType></input></td>';
        html += '<td><input id=projects.newSubmit type=submit></input></td>';
        html += '</tr></table><br>';
        $('#bodyDiv').html(html);
        projectFormFunctions(socket);
        $('#user').focus();
        // Add a new (random) note, emit to server to let others know
    });
    socket.on('projects.added',function(){
        socket.emit('projects.get');
    });
    socket.on('projects.modified',function(){
        socket.emit('projects.get');
    });
    socket.on('projects.deleted',function(){
        socket.emit('projects.get');
    });

    $('#headDiv').append('<span id=projects.head class="headElement">Projects</span>');
    $('#projects\\.head').click(function(){
        socket.emit('projects.get');
    });
};

var projectFormFunctions = function(socket){
    $('#projects\\.newName').keypress(function(e){
        if(e.which == 13){
            projectAddFunction(socket);
        }
    });
    $('#projects\\.newCustomer').keypress(function(e){
        if(e.which == 13){
            projectAddFunction(socket);
        }
    });
    $('#projects\\.newType').keypress(function(e){
        if(e.which == 13){
            projectAddFunction(socket);
        }
    });
    $('#projects\\.newSubmit').click(function(){
            projectAddFunction(socket);
    });
    $('.projects\\.entry').click(function(){
        var html = '<td><input id=projects.changeName value=' + projectData[this.id].name + '></input></td>';
        html += '<td><input id=projects.changeCustomer value=' + projectData[this.id].customer + '></input></td>';
        html += '<td><input id=projects.changeType value=' + projectData[this.id].type + '></input></td>';




        html += '<td><input id=projects.changeSubmit type=submit value=change class=' + this.id + '></input>';
        html += '<input id=projects.deleteSubmit type=submit value=delete class=' + this.id + '></input></td>'
        $('#' + this.id).html(html);
        $('.projects\\.entry').unbind();
        $('#projects\\.deleteSubmit').click(function(){
            var id=$('#projects\\.deleteSubmit').attr('class');
            socket.emit('projects.delete',{id:projectData[id].id});
        });
        $('#projects\\.changeSubmit').click(function(){
            var modProject = {};
            modProject.id=projectData[$('#projects\\.changeSubmit').attr('class')].id;
            modProject.name = $('#projects\\.changeName').val();
            modProject.customer = $('#projects\\.changeCustomer').val();
            modProject.type = $('#projects\\.changeType').val();
            socket.emit('projects.modify',{id:modProject.id,name:modProject.name,customer:modProject.customer,type:modProject.type});
        });
    });

};


var projectAddFunction = function(socket){
    var newProject = {};
    newProject.name = $('#projects\\.newName').val();
    newProject.customer = $('#projects\\.newCustomer').val();
    newProject.type = $('#projects\\.newType').val();
    socket.emit('projects.new',{name:newProject.name,customer:newProject.customer,type:newProject.type});
    $('#projects\\.newName').focus();
    return false;
}