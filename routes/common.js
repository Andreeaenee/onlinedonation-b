const express = require("express");
const asyncHandler = require("express-async-handler");
const router = express.Router();
const { verifyEmail } = require("../services/user/userAuth");

router.get("/verify-email/:token", asyncHandler((req, res) => verifyEmail(req, res, false)));
router.get("/forget-password/:token", asyncHandler((req, res) => verifyEmail(req, res, true)));

module.exports = router;
