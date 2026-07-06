const express = require("express");
const router = express.Router();
const { userDetails, FetchDetails} = require("../controllers/user");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/details", userDetails);
router.get("/users-details", FetchDetails);

module.exports = router;
