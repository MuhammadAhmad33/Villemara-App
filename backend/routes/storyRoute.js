const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const multer = require('multer');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');  // Specify the upload directory
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);  // Generate a unique filename
    }
});

const upload = multer({ storage: storage });

router.post('/create', upload.single('media'), storyController.createStory);
router.delete('/:id', storyController.deleteStory);
router.get('/:id', storyController.getStoryById);

module.exports = router;
