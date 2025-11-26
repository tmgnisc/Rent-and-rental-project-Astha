const nodemailer = require('nodemailer');
const { email } = require('../config/env');

if (!email?.user || !email?.pass) {
  throw new Error('Email credentials are not configured. Please set EMAIL_USER and EMAIL_PASS.');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: email.user,
    pass: email.pass,
  },
});

const sendEmail = async ({ to, subject, html, text }) => {
  await transporter.sendMail({
    from: email.from || email.user,
    to,
    subject,
    text,
    html,
  });
};

module.exports = {
  sendEmail,
};

