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

const botName = 'Sprinter';

// Run when client connects
io.on('connection', socket => {

    socket.on('joinRoom', ({ username, room }) => {

        const user = userJoin(socket.id, username, room);

        socket.join(user.room);


        // Welcomes current user
        if(username === "admin"){
            socket.emit('welcomeMessage', formatmessage(botName, 'Welcome to Admin Page for ' + room));
        }else{
            socket.emit('welcomeMessage', formatmessage(botName, 'Welcome to Sprinter. You will be able to vote once the server sends topic to vote on!!'));
        }
        

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
    socket.on('voteMessage', (msg) => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('voteMessage', formatmessage(user.username, msg));
    });

    // Listen for topics
    socket.on('topic', (msg) => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('topic', formatmessage(user.username, msg));
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

const port = 3000 || process.env.PORT;

server.listen(port, () => {
    console.log('app now listening for request on port 3000');
});