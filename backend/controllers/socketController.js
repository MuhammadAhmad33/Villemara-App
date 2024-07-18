// src/controllers/socketController.js
const Message = require('../models/message');
const UserSignup = require('../models/registration');

function socketController(io) {
    io.on('connect', (socket) => {
        console.log('A user connected');

        // Handle receiving a new message
        socket.on('sendMessage', async (data) => {
            try {
                const { senderId, receiverId, message } = data;

                // Verify that the sender and receiver IDs exist
                const sender = await UserSignup.findById(senderId);
                const receiver = await UserSignup.findById(receiverId);

                if (!sender || !receiver) {
                    return socket.emit('error', 'Sender or receiver not found');
                }

                // Create and save the message in the database
                const newMessage = new Message({ sender: senderId, receiver: receiverId, message });
                await newMessage.save();

                // Emit the message to the receiver
                socket.to(receiverId).emit('receiveMessage', newMessage);
            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('error', 'An error occurred while sending the message');
            }
        });

        // Handle user disconnect
        socket.on('disconnect', () => {
            console.log('A user disconnected');
        });
    });
}

module.exports = socketController;
