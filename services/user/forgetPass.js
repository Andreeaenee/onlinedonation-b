const {
  checkUserQuery,
  updateEmailVerificationTokenQuery,
  changePasswordQuery,
} = require('../../database/queries/userAuth');
const { sendPasswordResetEmail } = require('../../utils/email');
const asyncHandler = require('express-async-handler');
const { promisify } = require('util');
const pool = require('../../config/db');
const poolQuery = promisify(pool.query).bind(pool);
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const saltRounds = 11;

//Forgot password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  console.log('Email', email);
  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }
  try {
    // Check if user exists
    const result = await poolQuery(checkUserQuery, [email]);
    if (!result || !result.rows || result.rows.length === 0) {
      return res.status(404).json('User not found');
    }
    const { user_id } = result.rows[0];
    const currentTime = new Date();
    // Generate a new reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Update the verification token in the database
    const updateTokenResult = await poolQuery(
      updateEmailVerificationTokenQuery,
      [user_id, resetToken, currentTime]
    );

    if (!updateTokenResult || updateTokenResult.rowCount === 0) {
      return res.status(500).json('Failed to update reset token');
    }
    sendPasswordResetEmail(email, resetToken);
    // Respond with the reset token
    res.sendStatus(200);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

//Reset password
const resetPassword = asyncHandler(async (req, res) => {
  const { password, email } = req.body;
  if (!password || !email) {
    res.status(400);
    throw new Error(' Password and email are required');
  }
  try {
    // Get user_id from user
    const userResult = await poolQuery(checkUserQuery, [email]);
    if (!userResult || !userResult.rowCount) {
      return res.status(500).json('Failed to update user password');
    }
    const { user_id } = userResult.rows[0];
    // Update user password
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const result = await poolQuery(changePasswordQuery, [
      hashedPassword,
      user_id,
    ]);
    if (!result || !result.rowCount) {
      return res.status(500).json('Failed to update user password');
    }
    console.log('Password updated successfully');
    res.status(200).json('Password updated successfully');
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

module.exports = {
  forgotPassword,
  resetPassword,
};
