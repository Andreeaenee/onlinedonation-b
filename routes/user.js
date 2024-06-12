const express = require("express");
const asyncHandler = require("express-async-handler");
const router = express.Router();
const { addUserDB, logIn,getAccessTokenFromCode, completeRegistration, getUserEmail } = require("../services/user/userAuth");
const { forgotPassword, resetPassword } = require("../services/user/forgetPass");
const { uploadDocumentsMiddleware } = require("../middleware/uploads");

router.post("/user/credentials", asyncHandler(addUserDB));
router.get("/user/login", asyncHandler(logIn));
router.post("/user/register", uploadDocumentsMiddleware, asyncHandler(completeRegistration));
router.post("/user/forgot-password", asyncHandler(forgotPassword));
router.post("/user/reset-password", asyncHandler(resetPassword));
router.get("/user/email/:id", asyncHandler(getUserEmail));
router.post("/login", asyncHandler(getAccessTokenFromCode));


module.exports = router;
