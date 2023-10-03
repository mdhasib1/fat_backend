const nodemailer = require("nodemailer");
const env = require('dotenv');

env.config()

const Email = async (subject, message, send_to, sent_from, reply_to, logoAttachment,emailHeader) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const msg = {
    from: {
      name: emailHeader,
      address: sent_from,
    },
    to: send_to,
    replyTo: reply_to,
    subject: subject,
    html: message,
    attachments: [
      {
        ...logoAttachment,
        encoding: 'base64',
        contentType: 'image/png',
        cid: 'logo@pawcert.com',
        
      },
    ],
  };

  transporter.sendMail(msg, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log(info.response);
    }
  });
};


module.exports = Email;
