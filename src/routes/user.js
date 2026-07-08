const express = require("express");
const router = express.Router();
const { userDetails, FetchDetails, deleteUser} = require("../controllers/user");
const limiter = require("../utils/limiter");

router.post("/details", limiter, userDetails);
router.get("/users-details", FetchDetails);
router.delete("/delete-user/:id", deleteUser);

module.exports = router;
