const fs = require('fs');
const path = require('path');

exports.storeFile = ({ stream, filename }) => {
    const filepath = path.resolve(__dirname, '../public', 'storage', 'files', filename);

    return new Promise((resolve, reject) => {
        return stream.on('error', error => {
            if (stream.truncated) {
                // delete the truncated file
                fs.unlinkSync(filepath);
            }

            reject(error);
        })
        .pipe(fs.createWriteStream(filepath))
        .on('error', error => reject(error))
        .on('finish', () => resolve({ filepath }));
    });
};

exports.deleteFile = (filepath) => {
    fs.unlink(filepath, (err) => {
        if (err) {
            throw (err);
        }
    });
};