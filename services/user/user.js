const bcrypt = require('bcrypt');
const crypto = require('crypto');
const saltRounds = 11;
const asyncHandler = require('express-async-handler');
const { promisify } = require('util');
const pool = require('../../config/db');
const poolQuery = promisify(pool.query).bind(pool);
const { sendVerificationEmail } = require('../../utils/email');
const {
  addUserQuery,
  checkUserQuery,
  addVerificationEmailTokenQuery,
  getEmailQuery,
  getAllUsersQuery,
} = require('../../database/queries/userAuth');

// Add user
const addUserDB = asyncHandler(async (req, res) => {
  const { user_type_id, email, password } = req.body;
  if (!user_type_id || !email || !password) {
    res.status(400);
    throw new Error('Please fill all fields');
  }
  const status_id = 1;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  try {
    const checkUser = await poolQuery(checkUserQuery, [email]);
    if (checkUser.rows.length) {
      return res.status(400).json('User already exists');
    }

    const result = await poolQuery(addUserQuery, [
      user_type_id,
      email,
      hashedPassword,
      status_id,
    ]);
    if (!result || !result.rows || result.rows.length === 0) {
      return res.status(500).json('Unexpected database result');
    }

    const { user_id } = result.rows[0];
    const verificationToken = crypto.randomBytes(20).toString('hex');
    const result2 = await poolQuery(addVerificationEmailTokenQuery, [
      user_id,
      verificationToken,
    ]);
    if (!result2 || !result2.rows || result2.rows.length === 0) {
      return res.status(500).json('Unexpected database result');
    }

    sendVerificationEmail(email, verificationToken);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

// Get all users
const getUsers = asyncHandler(async (req, res) => {
  try {
    const result = await poolQuery(getAllUsersQuery);
    if (!result || !result.rows || result.rows.length === 0) {
      return res.status(404).json('Users not found');
    }
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

const getUserEmail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    res.status(400);
    throw new Error('User ID is required');
  }
  try {
    const result = await poolQuery(getEmailQuery, [id]);
    if (!result || !result.rows || result.rows.length === 0) {
      return res.status(404).json('User not found');
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});


module.exports = {
  addUserDB,
  getUserEmail,
  getUsers,
};
