const express = require('express');
const multer = require('multer');
const postController = require('../controllers/postController');

const router = express.Router();

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

// Routes
router.post('/create', upload.single('media'), postController.createPost);
router.get('/:id', postController.getPostById);
router.delete('/:id', postController.deletePost);

// Like, Comment, and Share routes
router.post('/:id/like', postController.likePost);
router.post('/:id/comment', postController.commentOnPost);
router.post('/:id/share', postController.sharePost);

module.exports = router;
