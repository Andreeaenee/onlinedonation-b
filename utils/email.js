const nodeMailer = require('nodemailer');

const createTransporter = () => {
  return nodeMailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.REST_API_USER_EMAIL,
      pass: process.env.REST_API_USER_PASSWORD,
    },
  });
};

const sendMail = async (transporter, mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent');
  } catch (error) {
    console.log('Error sending email:', error);
  }
};

const sendVerificationEmail = (email, verificationToken) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: {
      name: 'HopeShare',
      address: process.env.REST_API_USER_EMAIL,
    },
    to: email,
    subject: 'HopeShare Email Verification',
    text: `Please click the link below to verify your email: http://localhost:3000/verify-email/${verificationToken}`,
  };
  sendMail(transporter, mailOptions);
};

const sendPasswordResetEmail = (email, verificationToken) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: {
      name: 'HopeShare',
      address: process.env.REST_API_USER_EMAIL,
    },
    to: email,
    subject: 'HopeShare Reset Password',
    text: `Please click the link below to reset your password: http://localhost:3000/forget-password/${verificationToken}`,
  };
  sendMail(transporter, mailOptions);
};

const sendClaimDonationEmailWithDriverDetails = (email, donation) => {
  const transporter = createTransporter();
  const emailSent =
    email === 'admin@admin.com' ? process.env.REST_API_USER_EMAIL : email;
  const mailOptions = {
    from: {
      name: 'HopeShare',
      address: process.env.REST_API_USER_EMAIL,
    },
    to: emailSent,
    subject: 'HopeShare Update Donation',
    text: `
      Dear Donor,

      We are excited to inform you that your donation, "${donation.name}," has been successfully claimed by a driver.
      The driver's name is ${donation.first_name} ${donation.last_name} and their phone number is ${donation.contact_number}. They will pick up the donation from the following address: ${donation.pick_up_point} in approximately ${donation.approx_time} minutes.

      Thank you for your generous contribution and for supporting our cause.

      Best regards,
      The HopeShare Team
    `,
  };
  sendMail(transporter, mailOptions);
};

const sendClaimDonationEmailWithDeliveryAddress = (email, donation) => {
  const transporter = createTransporter();
  const emailSent =
    email === 'admin@admin.com' ? process.env.REST_API_USER_EMAIL : email;
  const mailOptions = {
    from: {
      name: 'HopeShare',
      address: process.env.REST_API_USER_EMAIL,
    },
    to: emailSent,
    subject: 'HopeShare Update Donation',
    text: `
    Dear Donor,

    We are pleased to inform you that your donation, "${donation.name}," has been successfully claimed by a driver.

    The donation will be delivered to the following address:
    ${donation.delivery_address}

    Thank you for your generous contribution and for supporting our cause.

    Best regards,
    The HopeShare Team
  `,
  };
  sendMail(transporter, mailOptions);
};

const sendAccountAcceptedEmail = (email) => {
  const transporter = createTransporter();
  const emailSent =
    email === 'admin@admin.com' ? process.env.REST_API_USER_EMAIL : email;
  const mailOptions = {
    from: {
      name: 'HopeShare',
      address: process.env.REST_API_USER_EMAIL,
    },
    to: emailSent,
    subject: 'HopeShare Account Verified',
    text: `
    Dear ${emailSent},

    We are delighted to inform you that your account has been successfully verified. You can now access and login to the HopeShare app.

    Thank you for being a part of our community and supporting our cause.

    Best regards,
    The HopeShare Team
  `,
  };
  sendMail(transporter, mailOptions);
};

const sendAccountRejectionEmail = (email) => {
  const transporter = createTransporter();
  const emailSent =
    email === 'admin@admin.com' ? process.env.REST_API_USER_EMAIL : email;
  const mailOptions = {
    from: {
      name: 'HopeShare',
      address: process.env.REST_API_USER_EMAIL,
    },
    to: emailSent,
    subject: 'HopeShare Account Rejected',
    text: `
    Dear User,

    We regret to inform you that your account verification has been rejected. This decision was made after careful consideration of the information provided.

    If you have any questions or believe this to be a mistake, please contact our support team for further assistance.

    Thank you for your understanding.

    Best regards,
    The HopeShare Team
  `,
  };
  sendMail(transporter, mailOptions);
};


module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendClaimDonationEmailWithDriverDetails,
  sendClaimDonationEmailWithDeliveryAddress,
  sendAccountAcceptedEmail,
  sendAccountRejectionEmail,
};
