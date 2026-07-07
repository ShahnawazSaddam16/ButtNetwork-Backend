const express = require("express");
const router = express.Router();
const { userDetails, FetchDetails} = require("../controllers/user");
const limiter = require("../utils/limiter");

router.post("/details", limiter, userDetails);
router.get("/users-details", limiter, FetchDetails);

module.exports = router;
