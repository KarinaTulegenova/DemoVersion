const express = require("express");
const {
  listHabits,
  getStats,
  createHabit,
  updateHabit,
  deleteHabit,
  listLogs,
  createLog,
} = require("../controllers/habitController");
const { requireAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { habitSchema } = require("../validators/habit");
const { logSchema } = require("../validators/log");

const router = express.Router();

router.get("/", requireAuth, listHabits);
router.get("/stats", requireAuth, getStats);
router.post("/", requireAuth, validate(habitSchema), createHabit);
router.put("/:id", requireAuth, validate(habitSchema), updateHabit);
router.delete("/:id", requireAuth, deleteHabit);

router.get("/:id/logs", requireAuth, listLogs);
router.post("/:id/logs", requireAuth, validate(logSchema), createLog);


module.exports = router;
