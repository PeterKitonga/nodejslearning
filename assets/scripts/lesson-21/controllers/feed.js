exports.getPosts = (req, res, next) => {
    let data = [{ id: '1622030276720', title: 'First Post', content: 'This is the first post!' }];

    res.status(200).json({ status: 'success', data });
};

exports.addPost = (req, res, next) => {
    const { title, content } = req.body;

    res.status(201).json({ status: 'success', data: { id: Date.now().toString(), title, content } });
};