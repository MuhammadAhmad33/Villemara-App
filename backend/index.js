const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const authRoute = require('./routes/authRoute');
const postRoutes = require('./routes/postRoute');
const listingRoute = require('./routes/listingRoute');
const storyRoute = require('./routes/storyRoute');
const profileRoute = require('./routes/profileRoute');
const socketController = require('./controllers/socketController');
const socketRoutes = require('./routes/socketRoute');
const config = require('./config/config');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Serve static files (for uploaded media)
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/auth', authRoute);
app.use('/posts', postRoutes);
app.use('/listings', listingRoute);
app.use('/story', storyRoute);
app.use('/profile', profileRoute);

// Socket
app.use('/socket', socketRoutes);
socketController(io);

// Connect to MongoDB
mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Start the server
const port = process.env.PORT || 5001;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
