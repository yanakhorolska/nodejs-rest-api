const { EMAIL_FROM, EMAIL_PASS, EMAIL_USER } = process.env;
const dotenv = require("dotenv");
dotenv.config();
const nodemailer = require("nodemailer");

async function sendMail(email, verificationToken) {
  const msg = {
    to: email,
    from: EMAIL_FROM,
    subject: "Verify your email for Contacts App",
    text: `Hello, thank you for registration! Follow this link to verify your email address - http://localhost:3000/api/users/verify/${verificationToken}. If you did not ask to verify this address, you can ignore this email. Your Contacts App team`,
    html: `<h1>Hello, thank you for registration!</h1><p>Follow this link to verify your email address.</p><a href='http://localhost:3000/api/users/verify/${verificationToken}'>Click here to confirm your email</a><p>If you did not ask to verify this address, you can ignore this email.</p><p>Your Contacts App team</p>`,
  };
  const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
  await transport.sendMail(msg);
}

module.exports = {
  sendMail,
};
