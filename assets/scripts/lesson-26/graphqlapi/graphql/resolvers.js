const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Post = require('../models/post');
const validator = require('validator');
const { storeFile, deleteFile } = require('../utils/file-manager');

module.exports = {
    async createUser({ user_input }, req) {
        const { email, name, password } = user_input;
        const errors = [];

        if (!validator.isEmail(email)) {
            errors.push({ message: 'The email field should be a valid email.', field: 'email' });
        }

        if (validator.isEmpty(password) || !validator.isLength(password, { min: 5 })) {
            errors.push({ message: 'The password field should be greater than 5 characters long.', field: 'password' });
        }

        if (errors.length > 0) {
            const error = new Error(`Invalid inputs.`);
            error.data = errors;
            error.code = 422;
            throw error;
        }

        const existing = await User.findOne({email});

        if (existing) {
            const error = new Error(`User with email '${email}' already exists`);
            throw error;
        }

        const hashed_password = await bcrypt.hash(password, 12);
        const user = new User({
            email, 
            name,
            password: hashed_password
        });

        const created_user = await user.save();

        return { ...created_user._doc, _id: created_user._id.toString() };
    },
    async login({ email, password }) {
        const user = await User.findOne({email});

        if (!user) {
            const error = new Error(`User with email '${email}' not found`);
            error.code = 401;
            throw error;
        }

        const matched = await bcrypt.compare(password, user.password);

        if (!matched) {
            const error = new Error('The password you entered is incorrect.');
            error.code = 401;
            throw error;
        }

        // generate token
        const token = jwt.sign(
            { 
                email: user.email,
                userId: user._id.toString()
            }, 
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return { token, userId: user._id.toString() };
    },
    async createPost({ post_input }, req) {
        if (!req.authenticated) {
            const error = new Error(`Unauthenticated request. Please login.`);
            error.code = 401;
            throw error;
        }

        const { title, content, image } = post_input;
        const upload = await image.file;
        const errors = [];

        if (validator.isEmpty(title) || !validator.isLength(title, { min: 5 })) {
            errors.push({ message: 'The title field should be greater than 5 characters long.', field: 'title' });
        }

        if (validator.isEmpty(content) || !validator.isLength(content, { min: 5 })) {
            errors.push({ message: 'The content field should be greater than 5 characters long.', field: 'content' });
        }

        if (upload === undefined) {
            errors.push({ message: 'The image field is required.', field: 'image' });
        }

        if (errors.length > 0) {
            const error = new Error(`Invalid inputs.`);
            error.data = errors;
            error.code = 422;
            throw error;
        }

        const { mimetype, createReadStream } = upload;
        const extension = mimetype.split('/')[1];
        const filename = `${Date.now()}.${extension}`;
        const stream = createReadStream();
        await storeFile({ stream, filename });
        const imageUrl = `${process.env.APP_BASE_URL}/storage/files/${filename}`;

        const user = await User.findById(req.userId);

        const post = new Post({
            title,
            content,
            imageUrl,
            creator: user
        });

        const saved_post = await post.save();
    
        user.posts.push(post);
        await user.save();

        return { 
            ...saved_post._doc, 
            _id: saved_post._id.toString(), 
            createdAt: saved_post.createdAt.toISOString(),
            updatedAt: saved_post.updatedAt.toISOString()
        };
    },
    async posts({ page }, req) {
        if (!req.authenticated) {
            const error = new Error(`Unauthenticated request. Please login.`);
            error.code = 401;
            throw error;
        }

        let current = page || 1;
        let per_page = 2;

        const count = await Post.find().countDocuments();
        const fetched = await Post.find().populate('creator').sort({createdAt: -1}).skip((current - 1) * per_page).limit(per_page);

        return { 
            posts: fetched.map(item => {
                return {
                    ...item._doc,
                    _id: item._id.toString(),
                    createdAt: item.createdAt.toISOString(),
                    updatedAt: item.updatedAt.toISOString()                 
                };
            }),
            totalItems: count 
        };
    },
    async post({ _id }, req) {
        if (!req.authenticated) {
            const error = new Error(`Unauthenticated request. Please login.`);
            error.code = 401;
            throw error;
        }

        const post = await Post.findById(_id).populate('creator');

        if (!post) {
            const error = new Error(`Could not find post by id ${_id}`);
            error.code = 404;
            throw error;
        }

        return {
            ...post._doc,
            _id: post._id.toString(),
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString()
        }
    },
    async updatePost({ _id, post_input}, req) {
        if (!req.authenticated) {
            const error = new Error(`Unauthenticated request. Please login.`);
            error.code = 401;
            throw error;
        }

        const { title, content, image } = post_input;
        const errors = [];
        let imageUrl;

        if (validator.isEmpty(title) || !validator.isLength(title, { min: 5 })) {
            errors.push({ message: 'The title field should be greater than 5 characters long.', field: 'title' });
        }

        if (validator.isEmpty(content) || !validator.isLength(content, { min: 5 })) {
            errors.push({ message: 'The content field should be greater than 5 characters long.', field: 'content' });
        }

        if (errors.length > 0) {
            const error = new Error(`Invalid inputs.`);
            error.data = errors;
            error.code = 422;
            throw error;
        }

        const post = await Post.findById(_id).populate('creator');
    
        if (!post) {
            const error = new Error(`Could not find post by id ${_id}`);
            error.code = 404;
            throw error;
        }

        if (post.creator._id.toString() !== req.userId) {
            const error = new Error(`Unauthorized. You do not have permission to perform this request.`);
            error.code = 403;
            throw error;
        }

        const upload = await image.file;

        if (upload) {
            const { mimetype, createReadStream } = upload;
            const extension = mimetype.split('/')[1];
            const filename = `${Date.now()}.${extension}`;
            const stream = createReadStream();
            await storeFile({ stream, filename });
            imageUrl = `${process.env.APP_BASE_URL}/storage/files/${filename}`;

            // ["http://127.0.0.1:8180/", "storage/files/1621249822068-fakeimg.png"] 
            const old_file = post.imageUrl.split(`${process.env.APP_BASE_URL}/`)[1];
            
            deleteFile(`./public/${old_file}`);
        } else {
            imageUrl = post.imageUrl;
        }

        post.title = title;
        post.content = content;
        post.imageUrl = imageUrl;

        const result = await post.save();

        return {
            ...result._doc,
            _id: result._id.toString(),
            createdAt: result.createdAt.toISOString(),
            updatedAt: result.updatedAt.toISOString()
        }
    },
    async deletePost({ _id }, req) {
        if (!req.authenticated) {
            const error = new Error(`Unauthenticated request. Please login.`);
            error.code = 401;
            throw error;
        }

        const post = await Post.findById(_id);

        if (!post) {
            const error = new Error(`Could not find post by id ${_id}`);
            error.code = 404;
            throw error;
        }

        if (post.creator.toString() !== req.userId) {
            const error = new Error(`Unauthorized. You do not have permission to perform this request.`);
            error.code = 403;
            throw error;
        }

        // ["http://127.0.0.1:8180/", "storage/files/1621249822068-fakeimg.png"] 
        const old_file = post.imageUrl.split(`${process.env.APP_BASE_URL}/`)[1];

        deleteFile(`./public/${old_file}`);

        const deleted = await Post.findByIdAndRemove(_id);

        const user = await User.findById(req.userId);
        
        user.posts.pull(_id);
        await user.save();

        return {
            ...deleted._doc,
            _id: deleted._id.toString(),
            creator: user._doc,
            createdAt: deleted.createdAt.toISOString(),
            updatedAt: deleted.updatedAt.toISOString()
        }
    },
    async getStatus(_, req) {
        if (!req.authenticated) {
            const error = new Error(`Unauthenticated request. Please login.`);
            error.code = 401;
            throw error;
        }

        if (!req.authenticated) {
            const error = new Error(`Unauthenticated request. Please login.`);
            error.code = 401;
            throw error;
        }

        const user = await User.findById(req.userId);
        const { status } = user; // user status

        return {
            status
        }
    },
    async updateStatus({ status }, req) {
        if (!req.authenticated) {
            const error = new Error(`Unauthenticated request. Please login.`);
            error.code = 401;
            throw error;
        }

        const user = await User.findById(req.userId);

        user.status = status;
        await user.save();

        return {
            status
        }
    }
};