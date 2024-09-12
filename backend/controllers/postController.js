const Post = require('../models/posts');
const Profile = require('../models/profile').Profile;
const { validationResult } = require('express-validator');
const { generateFileUrl } = require('../utils/uploadService');
const mongoose = require('mongoose');

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

        res.status(201).json({newPost,userId: profile.user});
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
    const userId = req.user._id;

    try {
        let post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Find the index of the like object with the current userId
        const likeIndex = post.likes.findIndex(like => like.user.toString() === userId.toString());

        if (likeIndex !== -1) {
            // User has already liked the post, so remove the like
            post.likes.splice(likeIndex, 1);
        } else {
            // User has not liked the post, so add the like
            const userProfile = await Profile.findOne({ user: userId })
                .select('name headline media');
            
            if (!userProfile) {
                return res.status(404).json({ message: 'User profile not found' });
            }

            // Create a like object with user details
            const likeObject = {
                user: userId,
                name: userProfile.name,
                headline: userProfile.headline,
                media: userProfile.media
            };

            // Add the like object to the post's likes array
            post.likes.push(likeObject);
        }

        // Save the post
        await post.save();

        // Fetch the updated post with populated likes
        post = await Post.findById(post._id).populate('likes.user', '_id');

        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


async function commentOnPost(req, res) {
    const userId = req.user._id;
    const { text } = req.body;

    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Fetch the user's profile
        const userProfile = await Profile.findOne({ user: userId }).select('name headline media');
        if (!userProfile) {
            return res.status(404).json({ message: 'User profile not found' });
        }

        const newComment = {
            user: userId,
            text: text,
            name: userProfile.name || 'Anonymous',
            headline: userProfile.headline || '',
            media: userProfile.media || '',
            createdAt: new Date()
        };

        // Add the new comment
        if (!Array.isArray(post.comments)) {
            post.comments = [];
        }
        post.comments.push(newComment);

        await post.save();

        // Fetch the newly added comment
        const addedComment = post.comments[post.comments.length - 1];

        res.status(200).json({
            message: 'Comment added successfully',
            comment: addedComment
        });
    } catch (error) {
        console.error('Error in commentOnPost:', error);
        res.status(500).json({ error: 'An error occurred while adding the comment' });
    }
}

async function sharePost(req, res) {
    const userId = req.user._id;

    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.shares.some(share => share.user.toString() === userId.toString())) {
            return res.status(400).json({ message: 'You have already shared this post' });
        }

        // Fetch the user's profile
        const userProfile = await Profile.findOne({ user: userId }).select('name headline media');
        if (!userProfile) {
            return res.status(404).json({ message: 'User profile not found' });
        }

        const newShare = {
            user: userId,
            name: userProfile.name,
            headline: userProfile.headline || '',
            media: userProfile.media || '',
            createdAt: new Date()
        };

        post.shares.push(newShare);
        await post.save();

        // Fetch the updated post with populated shares
        const updatedPost = await Post.findById(post._id)
            .populate('shares.user', '_id name')
            .populate('profile', 'name headline media');

        res.status(200).json({
            message: 'Post shared successfully',
            post: updatedPost
        });
    } catch (error) {
        console.error('Error in sharePost:', error);
        res.status(500).json({ error: 'An error occurred while sharing the post' });
    }
}


async function getAllPosts(req, res) {
    try {
        const posts = await Post.find()
            .populate({
                path: 'profile', // This should reference the Profile model
                select: 'user name headline media',
                model: 'Profile' // Ensure this is the correct model
            })
            .populate({
                path: 'taggedUsers',
                select: 'name',
                model: 'Profile' // Populate taggedUsers from the Profile model
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