
var socket = io();


document.addEventListener('DOMContentLoaded', function(e){

    

    socket.on('connect', ()=>{
        const message_button = document.getElementById('send');
        const message_input = document.getElementById('message');
        const chat_to_people = document.getElementById('chat_button');
        const display = document.getElementById('display');

        message_button.onclick = (e)=>{
            let message = message_input.value;
            let div = document.createElement('div');
            let content = document.createElement('p');
            content.innerHTML = message;
            div.appendChild(content);
            display.appendChild(div);
            socket.emit('message_to_chatbot', {'message' : message});
            message_input.value = '';
        }

        chat_to_people.onclick = ()=>{
            window.location.assign('/');
        }

        socket.on('chatbot_response', (data)=>{
            let response = data.response;
            let div = document.createElement('div');
            let content = document.createElement('p');
            content.innerHTML = response;
            div.appendChild(content);
            display.appendChild(div);
        })

    })

})


