const express = require('express');
const multer = require('multer');
const { body } = require('express-validator');
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
router.post('/create', [
    upload.single('media'),  // Middleware for file upload
    body('thoughts').not().isEmpty().withMessage('Thoughts are required'),
    // Add more validations as needed
], postController.createPost);

router.get('/:id', postController.getPostById);
router.delete('/:id', postController.deletePost);
router.post('/:id/like', postController.likePost);
router.post('/:id/comment', postController.commentOnPost);
router.post('/:id/share', postController.sharePost);

module.exports = router;
