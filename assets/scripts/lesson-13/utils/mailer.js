const ejs = require('ejs');
const path = require('path');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const root_directory = require('../utils/path');

dotenv.config(); // loads the .env variables

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_ENCRYPTION, //ssl
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    }
});

const send = (receiver, subject, message_options, view) => {
    // send mail with defined transport object
    return new Promise((resolve, reject) => {
        /**
         * Using ejs template for mail views
         * 
         * @link https://stackoverflow.com/questions/41304922/sending-ejs-template-using-nodemailer#answer-41337102
        */
        ejs.renderFile(path.join(root_directory, 'views', 'emails', view), message_options, function (err, data) {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                let mail_options = {
                    from: `"${process.env.MAIL_FROM_NAME}" ${process.env.MAIL_FROM_ADDRESS}`, // sender address (who sends)
                    to: receiver, // list of receivers (who receives)
                    subject: subject, // subject line
                    html: data // html body
                };
                
                transporter.sendMail(mail_options, (error, info) => {
                    if (error) {
                        console.error(`Couldn't send mail ${error}`);
                        reject(error);
                    } else {
                        console.log('Message sent: ' + info.response);
                        resolve(info.response);
                    }
                });
            }
        });
    });
};

module.exports = {
    send
};