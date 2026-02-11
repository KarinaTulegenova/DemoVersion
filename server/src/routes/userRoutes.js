const express = require("express");
const { getProfile, updateProfile } = require("../controllers/userController");
const { requireAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { profileSchema } = require("../validators/profile");

const router = express.Router();

router.get("/profile", requireAuth, getProfile);
router.put("/profile", requireAuth, validate(profileSchema), updateProfile);

module.exports = router;
