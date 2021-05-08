const topicForm = document.getElementById('topic-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and rom from url
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

// Join chat room
socket.emit('joinRoom', {
    username, room
});

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputRoomUsers(users);
});

// Vote Messages from server
socket.on('voteMessage', message => {
    console.log(message);
    outputMessage(message);

    // Scroll down
    // chatMessages.scrollTop = chatMessages.scrollHeight;

});

// Message Submit
topicForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get message text
    const topic = e.target.elements.topic.value;

    // Emit message to server
    socket.emit('topic', topic);

    $(".message").remove();
})

// Output message to DOM
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `${message.username} voted ${message.text}`;
    document.querySelector('.admin-messages').appendChild(div);

}

// Add room Name to DOM
function outputRoomName(room){
    roomName.innerText = room;
}

// Add room Users to DOM
function outputRoomUsers(users){
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}