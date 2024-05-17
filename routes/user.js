const express = require("express");
const asyncHandler = require("express-async-handler");
const router = express.Router();
const { addUserDB, logIn, getGoogleUserInfo,getAccessTokenFromCode } = require("../services/user/userAuth");
const { forgotPassword, resetPassword } = require("../services/user/forgetPass");

router.post("/user/credentials", asyncHandler(addUserDB));
router.get("/user/login", asyncHandler(logIn));
router.post("/user/forgot-password", asyncHandler(forgotPassword));
router.post("/user/reset-password", asyncHandler(resetPassword));
router.post("/login", asyncHandler(getAccessTokenFromCode));


module.exports = router;
