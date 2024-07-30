const Post = require('../models/posts');
const Profile = require('../models/profile').Profile;
const { validationResult } = require('express-validator');
const { generateFileUrl } = require('../utils/uploadService');

async function createPost(req, res) {
    try {
        console.log(req.body);
        console.log(req.file);

        // Retrieve the profile using the provided ID
        const profile = await Profile.findById(req.params.id);

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        console.log(profile);

        // Validate request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { thoughts, location, taggedUsers, tags } = req.body;
        let postMediaUrl = '';

        // Handle media upload if present
        if (req.file) {
            postMediaUrl = generateFileUrl('postMedia', req.file.path); // Generate URL for the uploaded file
        }

        // Create new post object
        const newPost = new Post({
            thoughts,
            media: postMediaUrl,
            location,
            taggedUsers: taggedUsers ? JSON.parse(taggedUsers) : [],
            tags: tags ? JSON.parse(tags) : [],
            profile: profile._id // Associate post with the user profile
        });

        console.log(newPost);

        // Save the post to the database
        await newPost.save();

        res.status(201).json(newPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: error.message });
    }
};


async function getPostById(req, res) {
    try {
        const post = await Post.findById(req.params.id)
        .populate({
            path: 'profile', // This should reference the Profile model
            select: 'name headline media',
            model: 'Profile' // Ensure this is the correct model
        })
        .populate({
            path: 'taggedUsers',
            select: 'name',
            model: 'Profile' // Populate taggedUsers from the Profile model
        })
        .populate({
            path: 'likes',
            select: 'name',
            model: 'Profile' // Populate likes from the Profile model
        })
        .populate({
            path: 'comments.user',
            select: 'name',
            model: 'Profile' // Populate comment users from the Profile model
        });

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
        const posts = await Post.find()
            .populate({
                path: 'profile', // This should reference the Profile model
                select: 'name headline media',
                model: 'Profile' // Ensure this is the correct model
            })
            .populate({
                path: 'taggedUsers',
                select: 'name',
                model: 'Profile' // Populate taggedUsers from the Profile model
            })
            .populate({
                path: 'likes',
                select: 'name',
                model: 'Profile' // Populate likes from the Profile model
            })
            .populate({
                path: 'comments.user',
                select: 'name',
                model: 'Profile' // Populate comment users from the Profile model
            });

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