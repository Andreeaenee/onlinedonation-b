
const asyncHandler = require('express-async-handler');
const { promisify } = require('util');
const pool = require('../config/db');
const poolQuery = promisify(pool.query).bind(pool);
const { getDonationStatusChartDataQuery } = require('../database/queries/chart');


const getDonationStatusChartData = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        res.status(400);
        throw new Error('User ID is required');
    }
    try {
        const result = await poolQuery(getDonationStatusChartDataQuery, [id]);
        if (!result || !result.rows || result.rows.length === 0) {
        return res.json('No data found');
        }
        res.json(result.rows);
    } catch (error) {
        res.status(500);
        throw new Error('Failed to get donation status chart data');
    }
    });

module.exports = { getDonationStatusChartData };