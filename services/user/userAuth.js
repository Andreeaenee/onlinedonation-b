const {
  addUserQuery,
  addVerificationEmailTokenQuery,
  getUserIdQuery,
  updateUserStatusQuery,
  updateEmailVerificationQuery,
  checkUserQuery,
  logInQuery,
} = require('../../database/queries/userAuth');
const { sendVerificationEmail } = require('../../utils/email');
const { calculateTokenExpiration } = require('../../utils/user');
const asyncHandler = require('express-async-handler');
const { promisify } = require('util');
const pool = require('../../config/db');
const poolQuery = promisify(pool.query).bind(pool);
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const axios = require('axios');
const saltRounds = 11;
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const privateKey = fs.readFileSync(path.join(__dirname, '../../utilsPasswords/private_key.pem'));


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

// Verify email
const verifyEmail = asyncHandler(async (req, res, isPasswordReset) => {
  const { token } = req.params;
  if (!token) {
    res.status(400);
    throw new Error('Token is required');
  }
  console.log('Token', token);
  try {
    // Get user_id from email_verification table
    const result = await poolQuery(getUserIdQuery, [token]);
    if (!result || !result.rows || result.rows.length === 0) {
      return res.status(404).json('Token not found');
    }
    const { user_id, created_at } = result.rows[0];
    const { currentTime, expirationTime } = calculateTokenExpiration(
      created_at,
      30
    ); // 30 minutes expiration

    // Check if the token has expired
    if (currentTime > expirationTime) {
      return res.status(400).json('Token has expired');
    }

    // Update user status
    if (!isPasswordReset) {
      const result1 = await poolQuery(updateUserStatusQuery, [user_id]);
      if (!result1 || !result1.rowCount) {
        return res.status(500).json('Failed to update user status');
      }

      // Update email verification status
      const result2 = await poolQuery(updateEmailVerificationQuery, [user_id]);
      if (!result2 || !result2.rowCount) {
        return res
          .status(500)
          .json('Failed to update email verification status');
      }
    }

    if (isPasswordReset) {
      return res.redirect(
        `${process.env.REST_API_FE}/login/reset-password/email-verified`
      );
    } else {
      return res.redirect(
        `${process.env.REST_API_FE}/login/register/email-verified`
      );
    }
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

// Log in
const logIn = asyncHandler(async (req, res) => {
  const { email, password } = req.query;
  if (!email || !password) {
    res.status(400);
    throw new Error('Please fill all fields');
  }
  try {
    const result = await poolQuery(logInQuery, [email]);
    if (!result || !result.rows || result.rows.length === 0) {
      return res.status(404).json('User not found');
    }

    const { status_id } = result.rows[0];
    switch (status_id) {
      case 1:
        return res.status(400).json('Email not verified');
      case 3:
        return res
          .status(400)
          .json("The registration process isn't complete yet");
    }
    const user = result.rows[0];
    const isMatch = bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json('Invalid credentials');
    }
    console.log('User', user);
    const token = generateToken(user);

    res.status(200).json({ token });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

// Log in with Google
const getAccessTokenFromCode = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const { data } = await axios({
    url: `https://oauth2.googleapis.com/token`,
    method: 'post',
    data: {
      client_id: process.env.REST_API_GOOGLE_CLIENT_ID,
      client_secret: process.env.REST_API_GOOGLE_CLIENT_SECRET,
      redirect_uri: 'http://localhost:3001/auth/google/callback',
      grant_type: 'authorization_code',
      code,
    },
  });
  const userData = await getGoogleUserInfo(data.access_token);
  console.log('userData', userData);
  const token = generateToken(userData);
  res.status(200).json({ token });
});

async function getGoogleUserInfo(access_token) {
  try {
    const { data } = await axios({
      url: 'https://www.googleapis.com/oauth2/v2/userinfo',
      method: 'get',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    // Check if the user exists in the database
    const checkUser = await poolQuery(checkUserQuery, [data.email]);
    if (checkUser.rows.length) {
      return data;
    }
    return { message: 'User does not exist in the database' };
  } catch (error) {
    console.error('Error fetching Google user info:', error);
    throw new Error('Error fetching Google user info');
  }
}

function generateToken(user) {

  const payload = {
    user_id: user.id || user.user_id,
    email: user.email,
  };
  // Sign the token with a secret key
  const token = jwt.sign(payload, privateKey, { algorithm: 'RS256', expiresIn: '1h' }); // Adjust token expiration as needed
  console.log('Token', token);
  return token;
}


module.exports = {
  addUserDB,
  verifyEmail,
  logIn,
  getGoogleUserInfo,
  getAccessTokenFromCode,
};
