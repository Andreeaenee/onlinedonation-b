const postDonationDriverDataQuery = `INSERT INTO donation_driver (first_name, last_name, contact_number, approx_time, donation_id) VALUES ($1, $2, $3, $4, $5) RETURNING driver_id`;

module.exports = {
  postDonationDriverDataQuery,
};
