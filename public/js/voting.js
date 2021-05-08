const roomName = document.getElementById('room-name');
const votingForm = document.getElementById('voting-form');
// Get username and rom from url
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

$(function() {
    $('input[name="vote"]').attr('disabled', 'disabled');
    $('#submitBtn').prop("disabled", true);
});

const socket = io();

// Join chat room
socket.emit('joinRoom', {
    username, room
});

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
});

// Message from server
socket.on('welcomeMessage', message => {
    console.log(message);
    outputMessage(message);
});

socket.on('topic', topic => {
    console.log("This is topic")
    console.log(topic);
    outputMessage(topic);
    $('input[name="vote"]').removeAttr('disabled');
    $('#submitBtn').prop("disabled", false);
    $("#voting-form")[0].reset()
})

// Message Submit
votingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get message text
    const msg = e.target.elements.vote.value;

    // Emit message to server
    socket.emit('voteMessage', msg);

    // Disable form
    $('input[name="vote"]').attr('disabled', 'disabled');
    $('#submitBtn').prop("disabled", true);
    
})

// Output message to DOM
function outputMessage(message) {
    document.getElementById("topicAlerts").innerHTML = `${message.text}`;

}

// Add room Name to DOM
function outputRoomName(room){
    roomName.innerText = room;
}