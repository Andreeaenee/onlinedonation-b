const {
  addDonationQuery,
  getDonationsQuery,
  getDonationByIdQuery,
  deleteDonationByIdQuery,
  updateDonationByIdQuery,
  updateDonationOnlyOngIdQuery,
  updateStatusDonationQuery,
  getDonationsByOngIdQuery,
  getDonationByRestaurantIdQuery,
  getDonationStatusQuery,
  getDonationAndDriverByIdQuery,
  getDonationByStatusQuery,
} = require('../database/queries/donation');
const { uploadMiddleware } = require('../middleware/uploads');
const { handleFileSizeLimit } = require('../middleware/uploads');
const asyncHandler = require('express-async-handler');
const { promisify } = require('util');
const pool = require('../config/db');
const {
  sendClaimDonationEmailWithDeliveryAddress,
  sendClaimDonationEmailWithDriverDetails,
  sendClaimDonationEmail,
} = require('../utils/email');
const { getEmailQuery } = require('../database/queries/userAuth');
const poolQuery = promisify(pool.query).bind(pool);

const addDonationDB = asyncHandler(async (req, res) => {
  uploadMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    handleFileSizeLimit(err, req, res, async () => {
      const {
        name,
        description,
        quantity,
        start_date,
        end_date,
        transport_provided,
        phone,
        pick_up_point,
        restaurant_id,
      } = req.body;

      if (
        !name ||
        !description ||
        !quantity ||
        !start_date ||
        !end_date ||
        !phone
      ) {
        res.status(400).json({ message: 'Please fill all fields' });
        return;
      }
      let status_id = 2;

      const imageId = req.file ? req.file.filename : null;
      try {
        const result = await poolQuery(addDonationQuery, [
          name,
          description,
          quantity,
          imageId,
          start_date,
          end_date,
          transport_provided,
          phone,
          pick_up_point,
          restaurant_id,
          status_id,
        ]);

        if (!result || !result.rows || result.rows.length === 0) {
          return res.status(500).json('Unexpected database result');
        }
        res
          .status(201)
          .json(`Donation ${result.rows[0].donation_id} has been created!`);
      } catch (err) {
        console.error('Error posting donation:', err);
        res.status(500).json('Unexpected error');
      }
    });
  });
});

const getDonationById = asyncHandler(async (req, res) => {
  const { donation_id } = req.params;
  try {
    const result = await poolQuery(getDonationByIdQuery, [
      parseInt(donation_id),
    ]);
    if (!result || !result.rows || result.rows.length === 0) {
      return res.status(404).json('Donation not found');
    }

    const donation = result.rows[0];
    if (donation.image_id) {
      donation.imageUrl = `${req.protocol}://${req.get(
        'host'
      )}/api/uploads/donations/${donation.image_id}`;
    }
    res.json(donation);
  } catch (err) {
    console.error('Error getting donations by id:', err);
    res.status(500).json('Unexpected error');
  }
});

const getDonations = asyncHandler(async (req, res) => {
  const { filter, filterId } = req.query;

  try {
    let query;
    let queryParams = [];

    switch (filter) {
      case 'ong':
        if (!filterId || isNaN(filterId)) {
          return res.status(400).json({ error: 'Valid Filter ID is required' });
        }
        query = getDonationsByOngIdQuery;
        queryParams.push(parseInt(filterId));
        break;
      case 'restaurant':
        if (!filterId || isNaN(filterId)) {
          return res.status(400).json({ error: 'Valid Filter ID is required' });
        }
        query = getDonationByRestaurantIdQuery;
        queryParams.push(parseInt(filterId));
        break;
      case 'status':
        if (!filterId || isNaN(filterId)) {
          return res.status(400).json({ error: 'Valid Filter ID is required' });
        }
        query = getDonationByStatusQuery;
        queryParams.push(parseInt(filterId));
        break;
      default:
        query = getDonationsQuery;
        break;
    }

    const result = await poolQuery(query, queryParams);

    if (!result || !result.rows || result.rows.length === 0) {
      return res.status(201).json('Donations not found');
    }

    const donationsWithImages = result.rows.map((donation) => ({
      ...donation,
      imageUrl: donation.image_id
        ? `${req.protocol}://${req.get('host')}/api/uploads/donations/${
            donation.image_id
          }`
        : null,
    }));

    res.json(donationsWithImages);
  } catch (err) {
    console.error('Error getting donations:', err);
    res.status(500).json('Unexpected error');
  }
});

const deleteDonationById = asyncHandler(async (req, res) => {
  const { donation_id } = req.params;
  try {
    const result = await poolQuery(deleteDonationByIdQuery, [
      parseInt(donation_id),
    ]);
    if (!result || !result.rows || result.rows.length === 0) {
      return res
        .status(200)
        .json(`Donation with ID ${donation_id} has been deleted`);
    }
    res.json(`Donation with ID ${donation_id} has been deleted`);
  } catch (err) {
    console.error('Error getting project by id:', err);
    res.status(500).json('Unexpected error');
  }
});

const updateDonationByIdOnClaim = asyncHandler(async (req, res) => {
  const { donation_id } = req.params;
  const { ong_id, delivery_address } = req.body;
  try {
    if (!delivery_address) {
      const result = await poolQuery(updateDonationOnlyOngIdQuery, [
        parseInt(donation_id),
        ong_id,
      ]);
      if (!result || !result.rowCount || result.rowCount === 0) {
        return res.status(404).json('Donation not found');
      }
      const result2 = await poolQuery(updateStatusDonationQuery, [
        parseInt(donation_id),
        1,
      ]);
      if (!result2 || !result2.rowCount || result2.rowCount === 0) {
        return res.status(404).json('Donation not found');
      }
      const claimData = await claimDonationData(donation_id, delivery_address);
      sendClaimDonationEmailWithDriverDetails(
        claimData.ongEmail,
        claimData.donation
      );
      sendClaimDonationEmailWithDriverDetails(
        claimData.restaurantEmail,
        claimData.donation
      );
      return res
        .status(200)
        .json(`Donation with ID ${donation_id} has been updated`);
    } else {
      const result = await poolQuery(updateDonationByIdQuery, [
        parseInt(donation_id),
        ong_id,
        delivery_address,
      ]);
      if (!result || !result.rowCount || result.rowCount === 0) {
        return res.status(404).json('Donation not found');
      }
      const result2 = await poolQuery(updateStatusDonationQuery, [
        parseInt(donation_id),
        1,
      ]);
      if (!result2 || !result2.rowCount || result2.rowCount === 0) {
        return res.status(404).json('Donation not found');
      }
      const claimData = await claimDonationData(donation_id, delivery_address);
      sendClaimDonationEmailWithDeliveryAddress(
        claimData.ongEmail,
        claimData.donation
      );
      sendClaimDonationEmailWithDeliveryAddress(
        claimData.restaurantEmail,
        claimData.donation
      );
      return res
        .status(200)
        .json(`Donation with ID ${donation_id} has been updated`);
    }
  } catch (err) {
    console.error('Error updating donation by id:', err);
    res.status(500).json('Unexpected error');
  }
});

const claimDonationData = asyncHandler(async (donation_id, address) => {
  try {
    let result;
    if (!address) {
      result = await poolQuery(getDonationAndDriverByIdQuery, [donation_id]);
      if (!result || !result.rows || result.rows.length === 0) {
        console.log('No results found for the first query');
        return null;
      }
    } else {
      result = await poolQuery(getDonationByIdQuery, [donation_id]);
      if (!result || !result.rows || result.rows.length === 0) {
        console.log('No results found for the first query');
        return null;
      }
    }
    const result1 = await poolQuery(getEmailQuery, [result.rows[0].ong_id]);
    if (!result1 || !result1.rows || result1.rows.length === 0) {
      console.log('No results found for the second query');
      return null;
    }

    const result2 = await poolQuery(getEmailQuery, [
      result.rows[0].restaurant_id,
    ]);
    if (!result2 || !result2.rows || result2.rows.length === 0) {
      console.log('No results found for the third query');
      return null;
    }
    return {
      donation: result.rows[0],
      ongEmail: result1.rows[0].email,
      restaurantEmail: result2.rows[0].email,
    };
  } catch (err) {
    console.error('Error getting donation and driver by id:', err);
    return null;
  }
});

const updateDonation = asyncHandler(async (req, res) => {
  const { donation_id } = req.params;
  const {
    name,
    description,
    quantity,
    start_date,
    end_date,
    transport_provided,
    phone,
    pick_up_point,
    restaurant_id,
  } = req.body;

  if (!donation_id) {
    res.status(400);
    throw new Error('Donation ID is required');
  }

  try {
    const image = req.file ? req.file.filename : null;

    const updateFields = [];
    const updateParams = [];
    let paramIndex = 1;

    if (name) {
      updateFields.push(`name = $${paramIndex++}`);
      updateParams.push(name);
    }
    if (description) {
      updateFields.push(`description = $${paramIndex++}`);
      updateParams.push(description);
    }
    if (quantity) {
      updateFields.push(`quantity = $${paramIndex++}`);
      updateParams.push(quantity);
    }
    if (image) {
      updateFields.push(`image_id = $${paramIndex++}`);
      updateParams.push(image);
    }
    if (start_date) {
      updateFields.push(`start_date = $${paramIndex++}`);
      updateParams.push(start_date);
    }
    if (end_date) {
      updateFields.push(`end_date = $${paramIndex++}`);
      updateParams.push(end_date);
    }
    if (transport_provided) {
      updateFields.push(`transport_provided = $${paramIndex++}`);
      updateParams.push(transport_provided);
    }
    if (phone) {
      updateFields.push(`phone = $${paramIndex++}`);
      updateParams.push(phone);
    }
    if (pick_up_point) {
      updateFields.push(`pick_up_point = $${paramIndex++}`);
      updateParams.push(pick_up_point);
    }
    if (restaurant_id) {
      updateFields.push(`restaurant_id = $${paramIndex++}`);
      updateParams.push(restaurant_id);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const updateQuery = `UPDATE donation SET ${updateFields.join(
      ', '
    )} WHERE donation_id = $${paramIndex}`;
    updateParams.push(donation_id);

    const result = await poolQuery(updateQuery, updateParams);

    if (!result || !result.rowCount) {
      return res.status(500).json('Failed to update donation');
    }

    res.status(200).json('Donation updated');
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

const updateDonationStatus = asyncHandler(async (req, res) => {
  const { donation_id } = req.params;
  const { status_id } = req.body;

  if (!donation_id) {
    res.status(400);
    throw new Error('Donation ID is required');
  }

  try {
    const result = await poolQuery(updateStatusDonationQuery, [
      parseInt(donation_id),
      status_id,
    ]);

    if (!result || !result.rowCount) {
      return res.status(500).json('Failed to update donation');
    }

    res.status(200).json('Donation updated');
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

const getDonationStatus = asyncHandler(async (req, res) => {
  try {
    const result = await poolQuery(getDonationStatusQuery);

    if (!result || !result.rows || result.rows.length === 0) {
      return res.status(404).json('Donation status not found');
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Error getting donation status:', err);
    res.status(500).json('Unexpected error');
  }
});

module.exports = {
  addDonationDB,
  getDonationById,
  getDonations,
  deleteDonationById,
  updateDonationByIdOnClaim,
  updateDonation,
  updateDonationStatus,
  getDonationStatus,
};
