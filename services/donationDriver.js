const {
  postDonationDriverDataQuery,
} = require("../database/queries/donationDriver");
const asyncHandler = require("express-async-handler");
const { promisify } = require("util");
const pool = require("../config/db");
const poolQuery = promisify(pool.query).bind(pool);

const addDonationDriverDB = asyncHandler(async (req, res) => {
  const { donation_id } = req.params;
  const { first_name, last_name, contact_number, approx_time } = req.body;
  console.log("Required body: ", req.body);
  try { 
    const result = await poolQuery(postDonationDriverDataQuery, [
      first_name,
      last_name,
      contact_number,
      approx_time,
      parseInt(donation_id),
    ]);
    if (!first_name || !last_name || !contact_number || !approx_time) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!result || !result.rows || result.rows.length === 0) {
      return res.status(500).json("Unexpected database result");
    }

    res
      .status(200)
      .json(`Donation driver ${result.rows[0].donation_id} has been created!`);
  } catch (err) {
    console.error("Error adding donation:", err);
    res.status(500).json("Unexpected error");
  }
});

module.exports = {
  addDonationDriverDB,
};
