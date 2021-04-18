const notFound = (req, res, next) => {
    res.status(404).render('errors/404', { page_title: 'Shop | Page Not Found', route_name: 'errors.404' });
};

module.exports = { notFound };