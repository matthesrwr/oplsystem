var openpointsData;
var groupData;
var userData;
var projectData;

var openpointsFunction = function(socket){

    // Initial set of notes, loop through and add to list
    socket.on('openpoints.send', function(data){
        openpointsData = data.openpoints;
        userData = data.user;
        projectData = data.projectData;
        groupData = data.groups;

        var html = '<br><table>';
        html += '<tr><td>project</td><td>point</td><td>explanation</td><td>creation date</td><td>due date</td><td>creator</td><td>responsible</td><td>group</td><td></td></tr>';

        for (var i = 0; i < openpointsData.length; i++){
             html += '<tr class=openpoints.entry id=' + i + '>';
            // We store html as a var then add to DOM after for efficiency
            var projectName = 'none';
            projectData.forEach(function(data,index,array){
                if(data.id === openpointsData[i].project){
                    projectName = data.name;
                }
            });
            html += '<td>' + projectName + '</td>';
            html += '<td>' + openpointsData[i].point + '</td>';
            html += '<td>' + openpointsData[i].explanation + '</td>';
            html += '<td>' + openpointsData[i].creationDate + '</td>';
            html += '<td>' + openpointsData[i].dueDate + '</td>';
            var creatorName = 'none';
            userData.forEach(function(data,index,array){
                if(data.id === openpointsData[i].creator){
                    creatorName = data.name;
                }
            });
            html += '<td>' + creatorName + '</td>';
            var resposiblePersonName = 'none';
            userData.forEach(function(data,index,array){
                if(data.id === openpointsData[i].responsiblePerson){
                    resposiblePersonName = data.name;
                }
            });
            html += '<td>' + resposiblePersonName + '</td>';
            var groupName = 'none';
            userData.forEach(function(data,index,array){
                if(data.id === openpointsData[i].responsiblePerson){
                    var groupID = data.groupID;
                    groupData.forEach(function(data,index,array){
                        if(data.id === groupID){
                            groupName = data.name;
                        }
                    });
                }
            });
            html += '<td>' + groupName + '</td>';
            html += '<td></td></tr>';
        }

        html += '<tr><td><select id=openpoints.newProject>';
        projectData.forEach(function(data,index,array){
            html += '<option value=' + data.id + '>' + data.name + '</input>';
        });
        html += '</select></td>';
        html += '<td><input id=openpoints.newPoint></input></td>';
        html += '<td><input id=openpoints.newExplanation></input></td>';
        html += '<td></td>';
        html += '<td><input id=openpoints.newDueDate></input></td>';
        html += '<td></td>';


        html += '<td><select id=openpoints.newResponsible>';
        userData.forEach(function(data,index,array){
            html += '<option value=' + data.id + '>' + data.name + '</input>';
        });
        html += '</select></td>';
        html += '<td></td>';
        html += '<td><input id=openpoints.newSubmit type=submit></input></td>';
        html += '</tr></table><br>';
        $('#bodyDiv').html(html);
        openpointsFormFunctions(socket);
        $('#user').focus();
        // Add a new (random) note, emit to server to let others know
    });
    socket.on('openpoints.added',function(){
        socket.emit('openpoints.get');
    });
    socket.on('openpoints.modified',function(){
        socket.emit('openpoints.get');
    });
    socket.on('openpoints.deleted',function(){
        socket.emit('openpoints.get');
    });

    $('#headDiv').append('<span id=points.head class="headElement">points</span>');
    $('#points\\.head').click(function(){
        socket.emit('openpoints.get');
    });
};

var openpointsFormFunctions = function(socket){
    $('#openpoints\\.newName').keypress(function(e){
        if(e.which == 13){
            openpointsAddFunction(socket);
        }
    });
    $('#openpoints\\.newHead').keypress(function(e){
        if(e.which == 13){
            openpointsAddFunction(socket);
        }
    });
    $('#openpoints\\.newSubmit').click(function(){
            openpointsAddFunction(socket);
    });
    $('.openpoints\\.entry').click(function(){
        var html = '<td><input id=openpoints.changeUser value=' + openpointsData[this.id].name + '></input></td>';
        var actID = this.id;
        html += '<td><select id=openpoints.changeHead>';
        userData.forEach(function(data,index,array){
            if(openpointsData[actID].head === data.id){
                html += '<option selected value=' + data.id + '>' + data.name + '</input>';
            }else{
                html += '<option value=' + data.id + '>' + data.name + '</input>';
            }
        });

        html += '</select></td>';



        html += '<td><input id=openpoints.changeSubmit type=submit value=change class=' + this.id + '></input>';
        html += '<input id=openpoints.deleteSubmit type=submit value=delete class=' + this.id + '></input></td>'
        $('#' + this.id).html(html);
        $('.openpoints\\.entry').unbind();
        $('#openpoints\\.deleteSubmit').click(function(){
            var id=$('#openpoints\\.deleteSubmit').attr('class');
            socket.emit('openpoints.delete',{id:openpointsData[id].id});
        });
        $('#openpoints\\.changeSubmit').click(function(){
            var modGroup = {};
            modGroup.id=openpointsData[$('#openpoints\\.changeSubmit').attr('class')].id;
            modGroup.name = $('#openpoints\\.changeUser').val();
            modGroup.head = $('#openpoints\\.changeHead').val();
            socket.emit('openpoints.modify',{id:modGroup.id,name:modGroup.name,head:modGroup.head});
        });
    });

};


var openpointsAddFunction = function(socket){
    var newGroup = {};
    newGroup.name = $('#openpoints\\.newName').val();
    newGroup.head = $('#openpoints\\.newHead').val();
    socket.emit('openpoints.new',{name:newGroup.name,head:newGroup.head});
    $('#openpoints\\.newName').focus();
    return false;
}