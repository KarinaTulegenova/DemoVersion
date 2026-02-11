const express = require("express");
const {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { requireAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { categorySchema } = require("../validators/category");

const router = express.Router();

router.get("/", requireAuth, listCategories);
router.post("/", requireAuth, validate(categorySchema), createCategory);
router.put("/:id", requireAuth, validate(categorySchema), updateCategory);
router.delete("/:id", requireAuth, deleteCategory);

module.exports = router;
