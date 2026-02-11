const express = require("express");
const { deleteLog } = require("../controllers/habitController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.delete("/:logId", requireAuth, deleteLog);

module.exports = router;
