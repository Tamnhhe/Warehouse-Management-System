const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    logger: true, // Enable logging to check detailed errors
    debug: true
});

const sendMail = (to, subject, text, html, callback) => {
    const mailOptions = {
        from: `"${process.env.SEND_NAME}"  <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        text: text,
        html: html
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return callback(error, null);
        }
        return callback(null, info);
    });
};

const testSendMail = (callback) => {
    const mailOptions = {
        from: `"${process.env.SEND_NAME}" <${process.env.EMAIL_USER}>`,
        to: `meomapgm@gmail.com`,
        subject: 'Test Email',
        text: 'This is a test email.',
        html: '<p>This is a test email.</p>'
    };
    console.log(mailOptions);
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return callback(error, null);
        }
        return callback(null, info);
    });
};

module.exports = { sendMail, testSendMail };
