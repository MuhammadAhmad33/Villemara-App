const Post = require('../models/posts');
const UserSignup = require('../models/registration');  // Ensure the correct path to the UserSignup model
const { validationResult } = require('express-validator');
const { generateFileUrl } = require('../utils/uploadService');

async function createPost(req, res) {
    try {
        console.log(req.body);
        console.log(req.file);
        // Validate request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { thoughts, location, taggedUsers, tags } = req.body;
        let mediaUrl = '';

        if (req.file) {
            mediaUrl = generateFileUrl('postMedia', req.file.path);  // Generate URL for the uploaded file
        }

        const newPost = new Post({
            thoughts,
            media: mediaUrl,
            location,
            taggedUsers: taggedUsers ? JSON.parse(taggedUsers) : [],
            tags: tags ? JSON.parse(tags) : []
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

async function getPostById(req, res) {
    try {
        const post = await Post.findById(req.params.id)
            // .populate('taggedUsers', 'firstName lastName email')
            .populate('likes', 'firstName lastName email')
            .populate('comments.user', 'firstName lastName email')
            .populate('shares', 'firstName lastName email');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

async function deletePost(req, res) {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

async function likePost(req, res) {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.likes.includes(req.body.userId)) {
            return res.status(400).json({ message: 'You have already liked this post' });
        }

        post.likes.push(req.body.userId);
        await post.save();

        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

async function commentOnPost(req, res) {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const newComment = {
            user: req.body.userId,
            text: req.body.text
        };

        post.comments.push(newComment);
        await post.save();

        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

async function sharePost(req, res) {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.shares.includes(req.body.userId)) {
            return res.status(400).json({ message: 'You have already shared this post' });
        }

        post.shares.push(req.body.userId);
        await post.save();

        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

async function getAllPosts(req, res) {
    try {
        const posts = await Post.find();
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    createPost,
    getPostById,
    deletePost,
    likePost,
    commentOnPost,
    sharePost,
    getAllPosts,
}