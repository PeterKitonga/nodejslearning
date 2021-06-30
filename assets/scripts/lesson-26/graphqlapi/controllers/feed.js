const fs = require('fs');
const Post = require('../models/post');
const User = require('../models/user');
const socket = require('../utils/socket');
const { validationResult } = require('express-validator');

const deleteFile = (file_path) => {
    fs.unlink(file_path, (err) => {
        if (err) {
            throw (err);
        }
    });
};

exports.getPosts = async (req, res, next) => {
    const { page } = req.query;
    let current = page || 1;
    let per_page = 2;

    try {
        const count = await Post.find().countDocuments();
        const posts = await Post.find().populate('creator').sort({createdAt: -1}).skip((current - 1) * per_page).limit(per_page);

        res.status(200).json({ 
            status: 'success', 
            data: posts,
            totalItems: count
        });
    } catch(err) {
        if (!err.status_code) {
            err.status_code = 500;
        }

        next(err);
    }
};

exports.addPost = async (req, res, next) => {
    const image = req.file;
    const { title, content } = req.body;
    const errors = validationResult(req);

    try {
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed, please check your inputs');
            error.status_code = 422;
            throw error;
        }
    
        if (!image) {
            const error = new Error('Validation failed, please upload an image');
            error.status_code = 422;
            throw error;
        }
    
        const storage_path = image.path.split('public')[1];
    
        // concatenate app url and storage path
        const imageUrl = process.env.APP_BASE_URL + storage_path;
    
        const post = new Post({
            title,
            content,
            imageUrl,
            creator: req.userId
        });

        await post.save();

        const user = await User.findById(req.userId);
    
        user.posts.push(post);
        await user.save();

        /**
         * Creates an event channel with a name
         * and object of our choice
        */
        socket.getIO().emit('posts', { 
            action: 'create', 
            post: {
                ...post._doc,
                creator: user
            }
        });
    
        res.status(201).json({ 
            status: 'success', 
            data: post,
            creator: user
        });
    } catch(err) {
        if (!err.status_code) {
            err.status_code = 500;
        }

        next(err);
    }
};

exports.getPost = async (req, res, next) => {
    const { _id } = req.params;

    try {
        const post = await Post.findById(_id);

        if (!post) {
            const error = new Error(`Could not find post by id ${_id}`);
            error.status_code = 404;
            throw error; // will be caught in the '.catch()' block
        }

        res.status(200).json({ status: 'success', data: post });
    } catch(err) {
        if (!err.status_code) {
            err.status_code = 500;
        }

        next(err);
    }
};

exports.updatePost = async (req, res, next) => {
    let imageUrl;
    const image = req.file;
    const { _id } = req.params;
    const { title, content } = req.body;
    const errors = validationResult(req);

    try {
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed, please check your inputs');
            error.status_code = 422;
            throw error;
        }
    
        const post = await Post.findById(_id).populate('creator');
    
        if (!post) {
            const error = new Error(`Could not find post by id ${_id}`);
            error.status_code = 404;
            throw error;
        } else {
            if (post.creator._id.toString() !== req.userId) {
                const error = new Error(`Unauthorized. You do not have permission to perform this request.`);
                error.status_code = 403;
                throw error;
            } else {
                if (image) {
                    // ["http://127.0.0.1:8180/", "storage/files/1621249822068-fakeimg.png"] 
                    const old_file = post.imageUrl.split(`${process.env.APP_BASE_URL}/`)[1];
            
                    deleteFile(`./public/${old_file}`);
                    
                    const storage_path = image.path.split('public')[1];
                
                    // concatenate app url and storage path
                    imageUrl = process.env.APP_BASE_URL + storage_path;
                } else {
                    imageUrl = post.imageUrl;
                }
    
                post.title = title;
                post.content = content;
                post.imageUrl = imageUrl;
    
                const result = await post.save();

                socket.getIO().emit('posts', {
                    action: 'update',
                    post: result
                });
    
                res.status(201).json({ 
                    status: 'success', 
                    data: result
                });
            }
        }
    } catch (err) {
        if (!err.status_code) {
            err.status_code = 500;
        }

        next(err);
    }
};

exports.deletePost = async (req, res, next) => {
    const { _id } = req.params;

    try {
        const post = await Post.findById(_id);

        if (post.creator.toString() !== req.userId) {
            const error = new Error(`Unauthorized. You do not have permission to perform this request.`);
            error.status_code = 403;
            throw error;
        } else {
            // ["http://127.0.0.1:8180/", "storage/files/1621249822068-fakeimg.png"] 
            const old_file = post.imageUrl.split(`${process.env.APP_BASE_URL}/`)[1];

            deleteFile(`./public/${old_file}`);

            const deleted = await Post.findByIdAndRemove(_id);

            const user = await User.findById(req.userId);
            
            user.posts.pull(_id);
            await user.save();

            socket.getIO().emit('posts', {
                action: 'delete',
                post: _id
            });

            res.status(200).json({ 
                status: 'success',
                data: deleted
            });
        }
    } catch (err) {
        if (!err.status_code) {
            err.status_code = 500;
        }

        next(err);
    }
};