const nodeMailer = require("nodemailer");

const sendVerificationEmail = (email, verificationToken) => {
  const transporter = nodeMailer.createTransport({
    service: "gmail",
    auth: {
      user: `${process.env.REST_API_USER_EMAIL}`,
      pass: `${process.env.REST_API_USER_PASSWORD}`,
    },
  });

  const mailOptions = {
    from: {
      name: "HopeShare",
      address: `${process.env.REST_API_USER_EMAIL}`,
    },
    to: email,
    subject: "HopeShare Email Verification",
    text: `Please click the link below to verify your email: http://localhost:3000/verify-email/${verificationToken}`,
  };

  const sendMail = async (transporter, mailOptions) => {
    try {
      await transporter.sendMail(mailOptions);
      console.log("Email sent");
    } catch (error) {
      console.log(error);
    }
  };

  sendMail(transporter, mailOptions);
};

const sendPasswordResetEmail = (email, verificationToken) => {
  const transporter = nodeMailer.createTransport({
    service: "gmail",
    auth: {
      user: `${process.env.REST_API_USER_EMAIL}`,
      pass: `${process.env.REST_API_USER_PASSWORD}`,
    },
  });

  const mailOptions = {
    from: {
      name: "HopeShare",
      address: `${process.env.REST_API_USER_EMAIL}`,
    },
    to: email,
    subject: "HopeShare Reset Password",
    text: `Please click the link below to reset you password: http://localhost:3000/forget-password/${verificationToken}`,
  };

  const sendMail = async (transporter, mailOptions) => {
    try {
      await transporter.sendMail(mailOptions);
      console.log("Email sent");
    } catch (error) {
      console.log(error);
    }
  };
  sendMail(transporter, mailOptions);
  console.log("Email sent");
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
