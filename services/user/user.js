const bcrypt = require('bcrypt');
const crypto = require('crypto');
const saltRounds = 11;
const asyncHandler = require('express-async-handler');
const { promisify } = require('util');
const pool = require('../../config/db');
const poolQuery = promisify(pool.query).bind(pool);
const { sendVerificationEmail } = require('../../utils/email');
const axios = require('axios');
const {
  addUserQuery,
  checkUserQuery,
  addVerificationEmailTokenQuery,
  getEmailQuery,
  getAllUsersQuery,
  getAllUsersByStatusQuery,
  getUserByIdQuery,
  updateUserStatusQuery,
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
  const { filter, filterId } = req.query;

  try {
    switch (filter) {
      case 'status_id':
        if (!filterId) {
          res.status(400);
          throw new Error('Filter ID is required');
        }
        const result1 = await poolQuery(getAllUsersByStatusQuery, [filterId]);
        if (!result1 || !result1.rows || result1.rows.length === 0) {
          return res.status(200).json('Users requests not found');
        }
        res.status(200).json(result1.rows);
        break;
      default:
        const result = await poolQuery(getAllUsersQuery);
        if (!result || !result.rows || result.rows.length === 0) {
          return res.status(200).json('Users not found');
        }
        res.status(200).json(result.rows);
        break;
    }
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'User ID must be a valid integer' });
  }
  if (!id) {
    res.status(400);
    throw new Error('User ID is required');
  }
  try {
    const result = await poolQuery(getUserByIdQuery, [id]);
    if (!result || !result.rows || result.rows.length === 0) {
      return res.status(404).json('User not found');
    }
    const user = result.rows[0];
    if (user.logo_id) {
      user.logoUrl = `${req.protocol}://${req.get('host')}/uploads/logo/${
        user.logo_id
      }`;
    }
    if (user.document_id) {
      user.documentUrl = `${req.protocol}://${req.get(
        'host'
      )}/uploads/document/${user.document_id}`;
    }
    if (user.main_photo_id) {
      user.mainPhotoUrl = `${req.protocol}://${req.get(
        'host'
      )}/uploads/cover-photo/${user.main_photo_id}`;
    }
    if (user.contracturl) {
      // call the contract url
      try {
        console.log('calling contract url', user.contracturl);
        const response = await axios({
          url: `${user.contracturl}`,
          method: 'get',
          headers: {
            'X-Auth-Token': `${process.env.REST_API_UVTSIGN_TOKEN}`,
          },
        });
        user.contract = response.data[0];
      } catch (error) {
        console.error('Error during getting the contract:', error.message);
      }
    }
    res.status(200).json(user);
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

const updateStatus = asyncHandler(async (req, res) => {
  const { id, status_id } = req.body;
  if (!id || !status_id) {
    res.status(400);
    throw new Error('User ID and status ID are required');
  }
  try {
    const result = await poolQuery(updateUserStatusQuery, [id, status_id]);
    if (!result || !result.rowCount === 0) {
      return res.status(404).json('Failed to update user status');
    }
    res.status(200).json('User status updated');
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, address, phone, link, cif, description } = req.body;

  if (!id) {
    res.status(400);
    throw new Error('User ID is required');
  }

  try {
    const logo_id = req.file ? req.file.filename : null;

    let updateQuery = 'UPDATE "user" SET ';
    const updateParams = [];
    let paramIndex = 1;

    if (name) {
      updateQuery += `name = $${paramIndex++}, `;
      updateParams.push(name);
    }
    if (address) {
      updateQuery += `address = $${paramIndex++}, `;
      updateParams.push(address);
    }
    if (phone) {
      updateQuery += `phone = $${paramIndex++}, `;
      updateParams.push(phone);
    }
    if (link) {
      updateQuery += `link = $${paramIndex++}, `;
      updateParams.push(link);
    }
    if (cif) {
      updateQuery += `cif = $${paramIndex++}, `;
      updateParams.push(cif);
    }
    if (description) {
      updateQuery += `description = $${paramIndex++}, `;
      updateParams.push(description);
    }
    if (logo_id) {
      updateQuery += `logo_id = $${paramIndex++}, `;
      updateParams.push(logo_id);
    }

    if (updateParams.length > 0) {
      updateQuery = updateQuery.slice(0, -2);
    } else {
      throw new Error('No fields to update');
    }

    updateQuery += ` WHERE user_id = $${paramIndex}`;
    updateParams.push(id);

    const result = await poolQuery(updateQuery, updateParams);

    if (!result || !result.rowCount) {
      return res.status(500).json('Failed to update user');
    }

    res.status(200).json('User updated');
  } catch (error) {
    console.error(error.message); 
    res.status(500);
    throw new Error(error.message);
  }
});


module.exports = {
  addUserDB,
  getUserEmail,
  getUsers,
  getUserById,
  updateStatus,
  updateUser,
};
