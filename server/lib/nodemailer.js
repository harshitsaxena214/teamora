import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: `${process.env.SMTP_HOST}`,
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendEmail = async ({ to, subject, body }) => {
  await transporter.sendMail({
    from: `${process.env.SENDER_EMAIL}`,
    to,
    subject,
    html: body,
  });
  return response;
};

export default sendEmail;
