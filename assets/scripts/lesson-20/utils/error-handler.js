const errorHandler = (err, next) => {
    const error = new Error(err);
    error.http_status_code = 500;

    return next(error);
};

module.exports = {
    errorHandler
};