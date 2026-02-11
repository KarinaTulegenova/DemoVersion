const express = require("express");
const {
  listReminders,
  createReminder,
  updateReminder,
  deleteReminder,
} = require("../controllers/reminderController");
const { requireAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { reminderSchema } = require("../validators/reminder");

const router = express.Router();

router.get("/", requireAuth, listReminders);
router.post("/", requireAuth, validate(reminderSchema), createReminder);
router.put("/:id", requireAuth, validate(reminderSchema), updateReminder);
router.delete("/:id", requireAuth, deleteReminder);

module.exports = router;
