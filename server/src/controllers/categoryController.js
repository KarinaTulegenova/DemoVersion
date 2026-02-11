const Category = require("../models/Category");
const { asyncHandler } = require("../middleware/async");

const listCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ user: req.user.id }).sort({ createdAt: -1 });
  return res.json(categories);
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create({ ...req.body, user: req.user.id });
  return res.status(201).json(category);
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ message: "Category not found." });
  }
  if (req.user.role !== "admin" && category.user.toString() !== req.user.id) {
    return res.status(403).json({ message: "Forbidden." });
  }

  Object.assign(category, req.body);
  await category.save();
  return res.json(category);
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ message: "Category not found." });
  }
  if (req.user.role !== "admin" && category.user.toString() !== req.user.id) {
    return res.status(403).json({ message: "Forbidden." });
  }

  await category.deleteOne();
  return res.json({ message: "Category deleted." });
});

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
