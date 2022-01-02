const nodemailer = require("nodemailer");

const MailHelper = async (data) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const Message = {
    from: "sachinpasi2000@gmail.com", // sender address
    to: data.email,
    subject: data.subject,
    text: data.message,
  };

  await transporter.sendMail(Message);
};

module.exports = MailHelper;
