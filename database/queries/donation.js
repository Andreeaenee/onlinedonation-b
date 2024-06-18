const addDonationQuery = `INSERT INTO Donation (name, description, quantity, image_id,  start_date, end_date, transport_provided, phone, pick_up_point, restaurant_id, status_id)
    VALUES
    ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING donation_id`;

const getDonationsQuery = `
    SELECT donation.*, "user".name AS restaurant_name, donation_status.name AS status_name
    FROM donation
    JOIN "user" ON "user".user_id = donation.restaurant_id
    JOIN donation_status ON donation.status_id = donation_status.id
    ORDER BY donation.donation_id;
    `;
const getDonationsByOngIdQuery = ` SELECT donation.*, "user".name AS restaurant_name, donation_status.name AS status_name FROM donation JOIN "user" ON "user".user_id = donation.restaurant_id JOIN donation_status ON donation.status_id = donation_status.id WHERE donation.ong_id = $1 ORDER BY donation.donation_id;`;
const getDonationByRestaurantIdQuery = ` SELECT donation.*, "user".name AS restaurant_name, donation_status.name AS status_name FROM donation JOIN "user" ON "user".user_id = donation.restaurant_id JOIN donation_status ON donation.status_id = donation_status.id WHERE donation.restaurant_id = $1 ORDER BY donation.donation_id;`;
const getDonationByIdQuery = `SELECT * FROM donation WHERE donation_id = $1`;

const deleteDonationByIdQuery = `DELETE FROM donation WHERE donation_id = $1`;

const updateDonationByIdQuery = `UPDATE donation
    SET ong_id = $2, delivery_address = $3
    WHERE donation_id = $1`;

const updateDonationOnlyOngIdQuery = `UPDATE donation
    SET ong_id = $2
    WHERE donation_id = $1`;
const updateStatusDonationQuery = `UPDATE donation
    SET status_id = $2
    WHERE donation_id = $1`;

module.exports = {
  addDonationQuery,
  getDonationByIdQuery,
  getDonationsQuery,
  deleteDonationByIdQuery,
  updateDonationByIdQuery,
  updateDonationOnlyOngIdQuery,
  updateStatusDonationQuery,
  getDonationsByOngIdQuery,
  getDonationByRestaurantIdQuery,
};
