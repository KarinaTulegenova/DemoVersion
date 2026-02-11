const Reminder = require("../models/Reminder");
const Habit = require("../models/Habit");
const { asyncHandler } = require("../middleware/async");

async function verifyHabitOwnership(habitId, user) {
  const habit = await Habit.findById(habitId);
  if (!habit) {
    return { error: "Habit not found.", status: 404 };
  }
  if (user.role !== "admin" && habit.user.toString() !== user.id) {
    return { error: "Forbidden.", status: 403 };
  }
  return { habit };
}

const listReminders = asyncHandler(async (req, res) => {
  const reminders = await Reminder.find({ user: req.user.id })
    .populate("habit", "title")
    .sort({ createdAt: -1 });
  return res.json(reminders);
});

const createReminder = asyncHandler(async (req, res) => {
  const { habitId } = req.body;
  const { habit, error, status } = await verifyHabitOwnership(habitId, req.user);
  if (error) {
    return res.status(status).json({ message: error });
  }

  const reminder = await Reminder.create({
    habit: habit._id,
    user: habit.user,
    time: req.body.time,
    daysOfWeek: req.body.daysOfWeek,
    enabled: req.body.enabled ?? true,
  });
  return res.status(201).json(reminder);
});

const updateReminder = asyncHandler(async (req, res) => {
  const reminder = await Reminder.findById(req.params.id);
  if (!reminder) {
    return res.status(404).json({ message: "Reminder not found." });
  }
  if (req.user.role !== "admin" && reminder.user.toString() !== req.user.id) {
    return res.status(403).json({ message: "Forbidden." });
  }

  if (req.body.habitId) {
    const { habit, error, status } = await verifyHabitOwnership(req.body.habitId, req.user);
    if (error) {
      return res.status(status).json({ message: error });
    }
    reminder.habit = habit._id;
    reminder.user = habit.user;
  }

  reminder.time = req.body.time ?? reminder.time;
  reminder.daysOfWeek = req.body.daysOfWeek ?? reminder.daysOfWeek;
  reminder.enabled = req.body.enabled ?? reminder.enabled;
  await reminder.save();

  return res.json(reminder);
});

const deleteReminder = asyncHandler(async (req, res) => {
  const reminder = await Reminder.findById(req.params.id);
  if (!reminder) {
    return res.status(404).json({ message: "Reminder not found." });
  }
  if (req.user.role !== "admin" && reminder.user.toString() !== req.user.id) {
    return res.status(403).json({ message: "Forbidden." });
  }

  await reminder.deleteOne();
  return res.json({ message: "Reminder deleted." });
});

module.exports = { listReminders, createReminder, updateReminder, deleteReminder };
