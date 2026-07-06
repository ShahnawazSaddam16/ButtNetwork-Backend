const express = require("express");
const router = express.Router();
const { userDetails, FetchDetails} = require("../controllers/user");

router.post("/details", userDetails);
router.get("/users-details", FetchDetails);

module.exports = router;
