const express = require('express');
const asyncHandler = require('express-async-handler');
const router = express.Router();
const {
  logIn,
  getAccessTokenFromCode,
  completeRegistration,
} = require('../services/user/userAuth');
const {
  addUserDB,
  getUserEmail,
  getUsers,
  getUserById,
  updateStatus,
  updateUser,
  getUsersWithCurrentDonations,
} = require('../services/user/user');
const {
  forgotPassword,
  resetPassword,
} = require('../services/user/forgetPass');
const {
  uploadDocumentsMiddleware,
  optionalLogoUpload,
} = require('../middleware/uploads');
const authMiddleware = require('../middleware/auth');
const { getDonationStatusChartData } = require('../services/charts');

router.post('/users/credentials', asyncHandler(addUserDB));
router.post('/users/forgot-password', asyncHandler(forgotPassword));
router.post('/users/reset-password', asyncHandler(resetPassword));
router.post(
  '/users/register',
  uploadDocumentsMiddleware,
  asyncHandler(completeRegistration)
);
router.post('/login', asyncHandler(getAccessTokenFromCode));

router.get('/users', authMiddleware, asyncHandler(getUsers));
router.get('/users/login', asyncHandler(logIn));
router.get('/users/today', asyncHandler(getUsersWithCurrentDonations));
router.get('/users/:id', asyncHandler(getUserById));
router.get('/users/email/:id', asyncHandler(getUserEmail));
router.get('/users/status/:id', asyncHandler(getDonationStatusChartData));

router.put('/users/status', authMiddleware, asyncHandler(updateStatus));
router.put(
  '/users/:id',
  authMiddleware,
  optionalLogoUpload,
  asyncHandler(updateUser)
);

module.exports = router;
