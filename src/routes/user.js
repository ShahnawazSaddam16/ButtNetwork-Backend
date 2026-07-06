const express = require("express");
const router = express.Router();
const { userDetails } = require("../controllers/user");

router.post("/details", userDetails);

module.exports = router;
