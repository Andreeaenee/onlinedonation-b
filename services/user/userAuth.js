const {
  getUserIdQuery,
  updateUserStatusQuery,
  updateEmailVerificationQuery,
  checkUserQuery,
  logInQuery,
  completeRegistrationQuery,
} = require('../../database/queries/userAuth');
const { calculateTokenExpiration } = require('../../utils/user');
const asyncHandler = require('express-async-handler');
const { promisify } = require('util');
const pool = require('../../config/db');
const poolQuery = promisify(pool.query).bind(pool);
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const privateKey = fs.readFileSync(
  path.join(__dirname, '../../utilsPasswords/private_key.pem')
);

// Verify email
const verifyEmail = asyncHandler(async (req, res, isPasswordReset) => {
  const { token } = req.params;
  if (!token) {
    res.status(400);
    throw new Error('Token is required');
  }
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
      const result1 = await poolQuery(updateUserStatusQuery, [user_id, 2]);
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
      return res
        .status(201)
        .redirect(
          `${process.env.REST_API_FE}/login/reset-password/email-verified`
        );
    } else {
      return res
        .status(201)
        .redirect(
          `${process.env.REST_API_FE}/login/register/email-verified/${user_id}`
        );
    }
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

const completeRegistration = asyncHandler(async (req, res) => {
  const { user_id, name, description, address, phone, link, cif } = req.body;

  if (!name || !address || !phone || !cif) {
    return res.status(400).json({ message: 'Please fill all fields' });
  }

  try {
    const logo_id = req.files.logo[0]?.filename || null;
    const cover_photo_id = req.files.coverPhoto[0]?.filename || null;
    const document_id = req.files.document[0]?.filename || null;
    const contract_id = req.files.contract[0]?.filename || null;

    const result = await poolQuery(completeRegistrationQuery, [
      name,
      address,
      phone,
      link,
      logo_id,
      cover_photo_id,
      document_id,
      cif,
      contract_id,
      user_id,
    ]);

    if (!result || !result.rowCount) {
      return res.status(500).json('Failed to complete registration process');
    }
    const result4 = await poolQuery(updateUserStatusQuery, [user_id, 3]);
    if (!result4 || !result4.rowCount) {
      return res.status(500).json('Failed to update user status');
    }

    res.status(200).json('Registration process completed');
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
      case 2:
        return res
          .status(400)
          .json('Email verified but registration is not complete');
      // case 3:
      //   return res
      //     .status(400)
      //     .json("The registration process isn't complete yet");
    }
    const user = result.rows[0];
    const isMatch = bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json('Invalid credentials');
    }
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
  const result = await poolQuery(logInQuery, [userData.email]);
  if (!result || !result.rows || result.rows.length === 0) {
    return res.status(404).json('User not found');
  }
  const token = generateToken(userData, result.rows[0]);
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

function generateToken(user, result) {
  const payload = {
    user_id: result?.user_id || user.user_id,
    email: user.email,
    user_type_id: result?.user_type_id || user.user_type_id,
  };
  // Sign the token with a secret key
  const token = jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: '1h',
  });
  return token;
}

module.exports = {
  verifyEmail,
  logIn,
  getAccessTokenFromCode,
  completeRegistration,
};
