const getDonationStatusChartDataQuery = `
  SELECT ds.name AS status_name, CAST(COUNT(*) AS INTEGER) AS value
  FROM Donation d
  JOIN donation_status ds ON d.status_id = ds.id
  WHERE d.restaurant_id = $1 OR d.ong_id = $1
  GROUP BY ds.name;
`;

const getDonationsAvailableCountQuery = `SELECT ds.name AS status_name, CAST(COUNT(*) AS INTEGER) AS value
  FROM Donation d
  JOIN donation_status ds ON d.status_id = ds.id
  WHERE DATE(d.post_date) = $1
  GROUP BY ds.name;`;

module.exports = {
  getDonationStatusChartDataQuery,
  getDonationsAvailableCountQuery,
};
