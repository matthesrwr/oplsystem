var openpointsData;
var grounpData;
var userData;
var projectData;

var openpointsFunction = function(socket){

    // Initial set of notes, loop through and add to list
    socket.on('openpoints.send', function(data){
        groupData = data.groups;
        userData = data.user;
        projectData = data.projectData;
        openpointsData = data.openpoints;

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
        html += '</table><br>';


        html += '<input id=groups.newName></input>';


        html += '<select id=groups.newHead>';
        userData.forEach(function(data,index,array){
            html += '<option value=' + data.id + '>' + data.name + '</input>';
        });

        html += '</select>';
        html += '<input id=groups.newSubmit type=submit></input>';
        $('#bodyDiv').html(html);
        groupFormFunctions(socket);
        $('#user').focus();
        // Add a new (random) note, emit to server to let others know
    });
    socket.on('groups.added',function(){
        socket.emit('groups.get');
    });
    socket.on('groups.modified',function(){
        socket.emit('groups.get');
    });
    socket.on('groups.deleted',function(){
        socket.emit('groups.get');
    });

    $('#headDiv').append('<span id=points.head class="headElement">points</span>');
    $('#points\\.head').click(function(){
        socket.emit('openpoints.get');
    });
};

var groupFormFunctions = function(socket){
    $('#groups\\.newName').keypress(function(e){
        if(e.which == 13){
            groupAddFunction(socket);
        }
    });
    $('#groups\\.newHead').keypress(function(e){
        if(e.which == 13){
            groupAddFunction(socket);
        }
    });
    $('#groups\\.newSubmit').click(function(){
            groupAddFunction(socket);
    });
    $('.groups\\.entry').click(function(){
        var html = '<td><input id=groups.changeUser value=' + groupData[this.id].name + '></input></td>';
        var actID = this.id;
        html += '<td><select id=groups.changeHead>';
        userData.forEach(function(data,index,array){
            if(groupData[actID].head === data.id){
                html += '<option selected value=' + data.id + '>' + data.name + '</input>';
            }else{
                html += '<option value=' + data.id + '>' + data.name + '</input>';
            }
        });

        html += '</select></td>';



        html += '<td><input id=groups.changeSubmit type=submit value=change class=' + this.id + '></input>';
        html += '<input id=groups.deleteSubmit type=submit value=delete class=' + this.id + '></input></td>'
        $('#' + this.id).html(html);
        $('.groups\\.entry').unbind();
        $('#groups\\.deleteSubmit').click(function(){
            var id=$('#groups\\.deleteSubmit').attr('class');
            socket.emit('groups.delete',{id:groupData[id].id});
        });
        $('#groups\\.changeSubmit').click(function(){
            var modGroup = {};
            modGroup.id=groupData[$('#groups\\.changeSubmit').attr('class')].id;
            modGroup.name = $('#groups\\.changeUser').val();
            modGroup.head = $('#groups\\.changeHead').val();
            socket.emit('groups.modify',{id:modGroup.id,name:modGroup.name,head:modGroup.head});
        });
    });

};


var groupAddFunction = function(socket){
    var newGroup = {};
    newGroup.name = $('#groups\\.newName').val();
    newGroup.head = $('#groups\\.newHead').val();
    socket.emit('groups.new',{name:newGroup.name,head:newGroup.head});
    $('#groups\\.newName').focus();
    return false;
}