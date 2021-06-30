const notFound = (req, res, next) => {
    res.status(404).render('errors/404', { page_title: 'Shop | Page Not Found', route_name: 'errors.404' });
};

const internalError = (req, res, next) => {
    res.status(500).render('errors/500', { page_title: 'Shop | Server Error', route_name: 'errors.500' });
};

module.exports = { notFound, internalError };