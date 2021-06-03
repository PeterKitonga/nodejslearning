const fs = require('fs');
const Post = require('../models/post');
const User = require('../models/user');
const { validationResult } = require('express-validator');

const deleteFile = (file_path) => {
    fs.unlink(file_path, (err) => {
        if (err) {
            throw (err);
        }
    });
};

exports.getPosts = (req, res, next) => {
    const { page } = req.query;

    let current = page || 1;
    let per_page = 2;
    let total_items;

    Post.find().countDocuments().then(count => {
        total_items = count;

        return Post.find({}).skip((current - 1) * per_page).limit(per_page);
    }).then(posts => {
        res.status(200).json({ 
            status: 'success', 
            data: posts,
            totalItems: total_items
        });
    }).catch(err => {
        if (!err.status_code) {
            err.status_code = 500;
        }

        next(err);
    });
};

exports.addPost = (req, res, next) => {
    let creator;
    const image = req.file;
    const { title, content } = req.body;
    const errors = validationResult(req);

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

    post.save().then(result => {
        return User.findById(req.userId);
    }).then(user => {
        creator = user;
        user.posts.push(post);
        return user.save();
    }).then(result => {
        res.status(201).json({ 
            status: 'success', 
            data: post,
            creator
        });
    }).catch(err => {
        if (!err.status_code) {
            err.status_code = 500;
        }

        next(err);
    });
};

exports.getPost = (req, res, next) => {
    const { _id } = req.params;

    Post.findById(_id).then(post => {
            if (!post) {
                const error = new Error(`Could not find post by id ${_id}`);
                error.status_code = 404;
                throw error; // will be caught in the '.catch()' block
            }

            res.status(200).json({ status: 'success', data: post });
        })
        .catch(err => {
            if (!err.status_code) {
                err.status_code = 500;
            }
    
            next(err);
        });
};

exports.updatePost = (req, res, next) => {
    let imageUrl;
    const image = req.file;
    const { _id } = req.params;
    const { title, content } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, please check your inputs');
        error.status_code = 422;
        throw error;
    }

    Post.findById(_id).then(post => {
        if (!post) {
            const error = new Error(`Could not find post by id ${_id}`);
            error.status_code = 404;
            throw error;
        } else {
            if (post.creator.toString() !== req.userId) {
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
    
                return post.save().then(result => {
                    res.status(201).json({ 
                        status: 'success', 
                        data: result
                    });
                });
            }
        }
    }).catch(err => {
        if (!err.status_code) {
            err.status_code = 500;
        }

        next(err);
    });
};

exports.deletePost = (req, res, next) => {
    let deleted;
    const { _id } = req.params;

    Post.findById(_id).then(post => {
        if (post.creator.toString() !== req.userId) {
            const error = new Error(`Unauthorized. You do not have permission to perform this request.`);
            error.status_code = 403;
            throw error;
        } else {
            // ["http://127.0.0.1:8180/", "storage/files/1621249822068-fakeimg.png"] 
            const old_file = post.imageUrl.split(`${process.env.APP_BASE_URL}/`)[1];
    
            deleteFile(`./public/${old_file}`);
    
            return Post.findByIdAndRemove(_id);
        }
    }).then(result => {
        deleted = result;

        return User.findById(req.userId);
    }).then(user => {
        user.posts.pull(_id);

        return user.save();
    }).then(result => {
        res.status(200).json({ 
            status: 'success',
            data: deleted
        });
    }).catch(err => {
        if (!err.status_code) {
            err.status_code = 500;
        }

        next(err);
    });
};