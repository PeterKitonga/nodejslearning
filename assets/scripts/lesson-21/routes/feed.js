const { Router } = require('express');
const router = Router();
const feedController = require('../controllers/feed');

router.get('/posts', feedController.getPosts);
router.post('/posts/add', feedController.addPost);

module.exports = { feed_routes: router };