const { Router } = require('express');
const { body } = require('express-validator');

const router = Router();
const feedController = require('../controllers/feed');
const authcheckMiddleware = require('../middlewares/auth-check');

router.get('/posts', authcheckMiddleware, feedController.getPosts);
router.post(
    '/posts/add',
    authcheckMiddleware,
    [
        body('title')
            .trim()
            .isLength({ min: 5 }),
        body('content')
            .trim()
            .isLength({ min: 5 })
    ],
    feedController.addPost
);
router.get('/posts/:_id', authcheckMiddleware, feedController.getPost);
router.put(
    '/posts/:_id/update',
    authcheckMiddleware,
    [
        body('title')
            .trim()
            .isLength({ min: 5 }),
        body('content')
            .trim()
            .isLength({ min: 5 })
    ],
    feedController.updatePost
);
router.delete('/posts/:_id/delete', authcheckMiddleware, feedController.deletePost);

module.exports = { feed_routes: router };