const express = require('express');
const asyncHandler = require('express-async-handler');
const router = express.Router();
const {
  addDonationDB,
  getDonationById,
  getDonations,
  deleteDonationById,
  updateDonationById,
} = require('../services/donation');
const { addDonationDriverDB } = require('../services/donationDriver');
const authMiddleware = require('../middleware/auth');

router.post('/donation', authMiddleware, asyncHandler(addDonationDB));
router.post(
  '/donations/:donation_id/drivers',
  authMiddleware,
  asyncHandler(addDonationDriverDB)
);
router.get('/donations', asyncHandler(getDonations));
router.get('/donations/:donation_id', asyncHandler(getDonationById));
router.delete(
  '/donations/:donation_id',
  authMiddleware,
  asyncHandler(deleteDonationById)
);
router.put(
  '/donations/:donation_id',
  authMiddleware,
  asyncHandler(updateDonationById)
);

module.exports = router;
