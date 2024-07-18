// testSocket.js
const { io } = require('socket.io-client');
const mongoose = require('mongoose');

// MongoDB connection string
const mongoURI = 'mongodb+srv://info:Pbs5J6pHH0hAi0Rr@villemara.rwikefz.mongodb.net/'; // Replace with your MongoDB connection string

// Connect to MongoDB
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Failed to connect to MongoDB', err));

const socket = io('http://localhost:5001'); // Adjust the URL to your server and port

const senderId = '668c09580bb67f400205a002'; // Replace with actual sender ID
const receiverId = '667c94e9f00619789f06b467'; // Replace with actual receiver ID

socket.on('connect', () => {
    console.log('Connected to Socket.io server');

    // Emit a test message
    socket.emit('sendMessage', {
        senderId,
        receiverId,
        message: 'Hello from sender!'
    });
});

socket.on('receiveMessage', (message) => {
    console.log('New message received:', message);
});

socket.on('error', (errorMessage) => {
    console.error('Error:', errorMessage);
});

socket.on('disconnect', () => {
    console.log('Disconnected from Socket.io server');
});
