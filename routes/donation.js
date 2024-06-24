const express = require('express');
const asyncHandler = require('express-async-handler');
const router = express.Router();
const {
  addDonationDB,
  getDonationById,
  getDonations,
  deleteDonationById,
  updateDonationByIdOnClaim,
  updateDonation,
} = require('../services/donation');
const { addDonationDriverDB } = require('../services/donationDriver');
const authMiddleware = require('../middleware/auth');
const { optionalUpload, optionalImageUpload } = require('../middleware/uploads');

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
  '/donations/claim/:donation_id',
  authMiddleware,
  asyncHandler(updateDonationByIdOnClaim)
);
router.put(
  '/donations/:donation_id',
  authMiddleware,
  optionalImageUpload,
  asyncHandler(updateDonation)
);
module.exports = router;
