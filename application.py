from flask import Flask, render_template, request
from flask_socketio import SocketIO, join_room, leave_room
import time

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

rooms = []
users = []
user_rooms = {}

@app.route('/')
def login():
    return render_template('login.html')

@app.route('/chat', methods=['POST'])
def chat():
    name = request.form.get('user')
    users.append(name)
    return render_template('chat.html', name=name, rooms=rooms)

@socketio.on('create_room')
def create_room(data):
    name = data['name']
    rooms.append(name)
    print('here')
    user_rooms[data['user']] = name
    print('there')
    join_room(name)
    socketio.emit('new_current_room', {'name' : name})
    socketio.emit('broadcast_room', {'name' : name}, broadcast=True)

@socketio.on('message')
def broadcast_message(data):
    user = data['user']
    message = data['message']

    socketio.emit('broadcast_message', {'user' : user, 'message' : message, 'timestamp' : time.strftime("%H:%M")}, room = data['room'])

@socketio.on('join_room')
def join(data):
    print('abletoprint')
    print(data)
    previous_room = data['previous_room']
    room = data['room']

    leave_room(previous_room)
    join_room(room)
    socketio.emit('new_current_room', {'name' : room})

if __name__ == '__main__':
    socketio.run(app)