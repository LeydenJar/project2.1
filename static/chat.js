var room_buttons = document.getElementsByClassName('room-button');
var current_room = localStorage.getItem('current_room');
var socket = io();


console.log(current_room);

function getRooms(){
    room_buttons = document.querySelectorAll('.room-button');
    room_buttons.forEach(function(button){
        button.onclick = ()=>{
            console.log('trying to change room');
            console.log('going to ' + button.innerHTML + ', leaving ' + current_room );
            socket.emit('join_room', {'room' : button.innerHTML, 'previous_room' : current_room});
            
        }
    });
}


document.addEventListener('DOMContentLoaded', function(e){
    
   
    socket.on('connect', ()=>{

        if (current_room && current_room !== 'null'){
            socket.emit('join_room', {'room' : current_room, 'previous_room' : false});
        }

        console.log('socket connected');
        getRooms()
        const create_room_button = document.getElementById('create_room_button');
        const create_room_input = document.getElementById('create_room_input');
        const room_selection = document.getElementById('choices');
        const message_input = document.getElementById('message');
        const message_button = document.getElementById('send');
        const message_display = document.getElementById('display');
        const change_username = document.getElementById('change_username');
        const chatbot = document.getElementById('chatbot');
        const change_username_screen = document.getElementById('change_username_screen');
        const change_button = document.getElementById('change');
        const newname = document.getElementById('newname');
        


        //Going to chatbot page
        chatbot.onclick = ()=>{
            window.location.assign('/chatbot');
        }


        //changing username

        change_username.onclick = ()=>{
            change_username_screen.classList.remove('invisible');
        }

        change_button.onclick = ()=>{
            localStorage.setItem('user', newname.value);
            change_username_screen.classList.add('invisible');
            document.getElementById('name').innerHTML = newname.value;
            newname.value = '';
        }
        

        create_room_button.onclick = (e)=>{
            let rooms = document.getElementsByClassName('room-button');

            let name = create_room_input.value;
            let conflict = false;
            for (i=0; i<rooms.length; i++){
                conflict = (rooms[i].innerHTML == name);
            }
            
            if (conflict){
                alert('room already exists');
            }else{

                if (name.length <= 12 && name.length >= 4){
                    socket.emit('create_room', {'name' : name, 'user': localStorage.getItem('user')});
                    create_room_input.value = '';
                }
                else{
                    alert('room name must be between 4 and 12 characters');
                }
            }
        }

        socket.on('broadcast_room', (data)=>{
            let name = data.name;
            let button = document.createElement('button');
            button.classList.add('room-button', 'fluffy-button');
            button.innerHTML = name;
            room_selection.appendChild(button);
            getRooms();

        })


        message_button.onclick = (e)=>{
            let user = localStorage.getItem('user');
            let message = message_input.value;
            socket.emit('message', {'user' : user, 'message' : message, 'room': current_room});
            message_input.value = '';
        }

        socket.on('broadcast_message', (data)=>{
            let user = data.user;
            let message = data.message;
            let div = document.createElement('div');
            let content = document.createElement('p');
            let timestamp = document.createElement('p');
            timestamp.innerHTML = data.timestamp;
            timestamp.classList.add('timestamp');
            content.innerHTML = '<b>' + user + '</b>' + ' - ' + message;
            div.appendChild(content);
            div.appendChild(timestamp);
            message_display.appendChild(div);

        })


        socket.on('new_current_room', (data)=>{

            console.log(data);
            localStorage.setItem('current_room', data.name);
            current_room = data.name;
            message_display.innerHTML = '';
            console.log('cleaned message display, data.messages is:');
            console.log(data.messages);
            console.log('and has a length of' + data.messages.length);
            if (data.messages.length > 0){
                for (var i=0; i < data.messages.length; i++){
                    console.log('i is equal to ' + i);
                    console.log('data_messages[i] is ');
                    let user = data.messages[i].user;
                    let message = data.messages[i].message;
                    let div = document.createElement('div');
                    let content = document.createElement('p');
                    let timestamp = document.createElement('p');
                    timestamp.innerHTML = data.messages[i].timestamp;
                    timestamp.classList.add('timestamp');
                    content.innerHTML = '<b>' + user + '</b>' + ' - ' + message;
                    div.appendChild(content);
                    div.appendChild(timestamp);
                    message_display.appendChild(div);
                }
            }
            
        })

    })
})