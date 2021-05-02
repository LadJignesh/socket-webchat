const express = require('express');
const http = require('http');
const socketio = require('socket.io');
var path = require('path');
const formatmessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set Static folder
app.use(express.static(path.join(__dirname, '/public')));

const botName = 'ChatCord Bot';

// Run when client connects
io.on('connection', socket => {

    socket.on('joinRoom', ({ username, room }) => {

        const user = userJoin(socket.id, username, room);

        socket.join(user.room);


        // Welcomes current user
        socket.emit('message', formatmessage(botName, 'Welcome to chatCord'));

        // Broadcast when user connects
        socket.broadcast
            .to(user.room)
            .emit(
                'message',
                formatmessage(botName, `${user.username} has joined the chat`));


        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    // Listen for chatMessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatmessage(user.username, msg));
    });

    // Broadcast when user disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room)
                .emit(
                    'message',
                    formatmessage(botName, `${user.username} has left the chat`)
                );

        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
        }
        
    });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => {
    console.log(`Server now listening for request on port ${PORT}`);
});