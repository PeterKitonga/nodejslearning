const fs = require('fs');
const path = require('path');

const deleteFile = (file_path) => {
    fs.unlink(file_path, (err) => {
        if (err) {
            throw (err);
        }
    });
};

module.exports = {
    deleteFile
};