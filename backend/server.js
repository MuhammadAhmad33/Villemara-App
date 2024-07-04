const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoute = require('./routes/authRoute');
const postRoutes = require('./routes/postRoute');
const listingRoute = require('./routes/listingRoute');
const storyRoute = require('./routes/storyRoute')
const profileRoute = require('./routes/profileRoute')
const config = require('./config/config');

const app = express();

// Middleware
app.use(bodyParser.json());
// Serve static files (for uploaded media)
app.use('/uploads', express.static('uploads'));


// Routes
app.use('/auth', authRoute);
app.use('/posts', postRoutes);
app.use('/listings', listingRoute);
app.use('/story', storyRoute)
app.use('/profile', profileRoute)

// Connect to MongoDB
mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Start the server
const port = process.env.PORT || 5001;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

