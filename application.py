from flask import Flask, render_template, request
from flask_socketio import SocketIO, join_room, leave_room
from chatterbot import ChatBot
from chatterbot.trainers import ChatterBotCorpusTrainer
import time

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)
chatter = ChatBot('chatty')
trainer = ChatterBotCorpusTrainer(chatter)

trainer.train(
    "chatterbot.corpus.english"
)

rooms = []
user_rooms = {}
rooms_messages = {}

@app.route('/')
def login():
    return render_template('login.html')

@app.route('/chat', methods=['POST'])
def chat():
    name = request.form.get('user')
    return render_template('chat.html', name=name, rooms=rooms)

@app.route('/chatbot')
def chatbot():
    return render_template('chatbot.html')

@socketio.on('create_room')
def create_room(data):
    name = data['name']
    if len(name) >= 4 and len(name) <=12:
        if name not in rooms: 
            rooms.append(name)
            user_rooms[data['user']] = name
            join_room(name)
            rooms_messages[name] = []
            socketio.emit('new_current_room', {'name' : name, 'messages' : []})
            socketio.emit('broadcast_room', {'name' : name}, broadcast=True)

@socketio.on('message')
def broadcast_message(data):
    user = data['user']
    message = data['message']
    room = data['room']
    timestamp = time.strftime("%H:%M")
    if len(rooms_messages[room]) == 100:
        rooms_messages[room].pop(0)
    rooms_messages[room].append({'user' : user, 'message' : message, 'timestamp' : timestamp})
    

    socketio.emit('broadcast_message', {'user' : user, 'message' : message, 'timestamp' : timestamp}, room = room)

@socketio.on('join_room')
def join(data):
    print('joining_room')
    print(data)
    previous_room = data['previous_room']
    room = data['room']
    messages = rooms_messages[room]
    leave_room(previous_room)
    join_room(room)
    print('emmiting new_current_room event')
    print({'name' : room, 'messages' : messages})
    socketio.emit('new_current_room', {'name' : room, 'messages' : messages})


@socketio.on('message_to_chatbot')
def message_chatbot(data):
    message = data['message']
    response = chatter.get_response(message)
    print(response)
    socketio.emit('chatbot_response', {'response' : response.text})


if __name__ == '__main__':
    socketio.run(app)