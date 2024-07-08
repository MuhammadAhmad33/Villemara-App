// src/utils/sendEmail.js
const { Resend } = require('resend');
const config = require('../config/config');

const resend = new Resend(config.resendKey);

async function sendEmail(to, subject, text) {
    try {
        console.log('Sending email...');
        const { data, error } = await resend.emails.send({
            from: 'noreply@villemara.com',
            to: [to],
            subject: subject,
            text: text,
        });

        if (error) {
            console.error('Error sending email:', error);
            return false;
        }

        console.log('Email sent successfully:', data);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

module.exports = sendEmail;
