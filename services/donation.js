const {
  addDonationQuery,
  getDonationsQuery,
  getDonationByIdQuery,
  deleteDonationByIdQuery,
  updateDonationByIdQuery,
  updateDonationOnlyOngIdQuery,
} = require("../database/queries/donation");
const { uploadMiddleware } = require("../middleware/uploads");
const { handleFileSizeLimit } = require("../middleware/uploads");
const asyncHandler = require("express-async-handler");
const { promisify } = require("util");
const pool = require("../config/db");
const poolQuery = promisify(pool.query).bind(pool);

const addDonationDB = asyncHandler(async (req, res) => {
  uploadMiddleware(req, res, (err) => {
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
      } = req.body;

      if (
        !name ||
        !description ||
        !quantity ||
        !start_date ||
        !end_date ||
        !phone
      ) {
        res.status(400);
        throw new Error("Please fill all fields");
      }

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
        ]);
        if (!result || !result.rows || result.rows.length === 0) {
          return res.status(500).json("Unexpected database result");
        }

        res
          .status(201)
          .json(`Donation ${result.rows[0].donation_id} has been created!`);
      } catch (err) {
        console.error("Error posting donation:", err);
        res.status(500).json("Unexpected error");
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
      return res.status(404).json("Donation not found");
    }

    const donation = result.rows[0];
    if (donation.image_id) {
      donation.imageUrl = `${req.protocol}://${req.get(
        "host"
      )}/uploads/donations/${donation.image_id}`;
    }
    res.json(donation);
  } catch (err) {
    console.error("Error getting donations by id:", err);
    res.status(500).json("Unexpected error");
  }
});

const getDonations = asyncHandler(async (req, res) => {
  try {
    const result = await poolQuery(getDonationsQuery);
    if (!result || !result.rows || result.rows.length === 0) {
      return res.status(404).json("Donations not found");
    }
    const donationsWithImages = result.rows.map((donation) => {
      if (donation.image_id) {
        return {
          ...donation,
          imageUrl: `${req.protocol}://${req.get("host")}/uploads/donations/${
            donation.image_id
          }`,
        };
      }
      return donation;
    });

    res.json(donationsWithImages);
  } catch (err) {
    console.error("Error getting donations:", err);
    res.status(500).json("Unexpected error");
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
    console.error("Error getting project by id:", err);
    res.status(500).json("Unexpected error");
  }
});

const updateDonationById = asyncHandler(async (req, res) => {
  const { donation_id } = req.params;
  const { ong_id, delivery_address } = req.body;
  try {
    if (!delivery_address) {
      const result = await poolQuery(updateDonationOnlyOngIdQuery, [
        parseInt(donation_id), // $1
        ong_id, // $2
      ]);
      if (!result || !result.rowCount || result.rowCount === 0) {
        return res.status(404).json("Donation not found");
      }
      return res
        .status(200)
        .json(`Donation with ID ${donation_id} has been updated`);
    } else {
      const result = await poolQuery(updateDonationByIdQuery, [
        parseInt(donation_id), // $1
        ong_id, // $2
        delivery_address, // $3
      ]);
      if (!result || !result.rowCount || result.rowCount === 0) {
        return res.status(404).json("Donation not found");
      }
      return res
        .status(200)
        .json(`Donation with ID ${donation_id} has been updated`);
    }
  } catch (err) {
    console.error("Error updating donation by id:", err);
    res.status(500).json("Unexpected error");
  }
});

module.exports = {
  addDonationDB,
  getDonationById,
  getDonations,
  deleteDonationById,
  updateDonationById,
};
