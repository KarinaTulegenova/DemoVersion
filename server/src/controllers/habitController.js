const Habit = require("../models/Habit");
const HabitLog = require("../models/HabitLog");
const { asyncHandler } = require("../middleware/async");
const { startOfDay, endOfDay } = require("../utils/date");

const listHabits = asyncHandler(async (req, res) => {
  const filter = { user: req.user.id };
  const habits = await Habit.find(filter).sort({ createdAt: -1 });
  return res.json(habits);
});

const getStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const [totalHabits, activeHabits] = await Promise.all([
    Habit.countDocuments({ user: userId }),
    Habit.countDocuments({ user: userId, isActive: true }),
  ]);

  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());
  const completedHabitIds = await HabitLog.find({
    user: userId,
    status: "completed",
    date: { $gte: todayStart, $lte: todayEnd },
  }).distinct("habit");

  const completedToday = completedHabitIds.length;

  const habits = await Habit.find({ user: userId }).select("_id");
  let bestStreak = 0;

  for (const habit of habits) {
    const logs = await HabitLog.find({ habit: habit._id, status: "completed" }).sort({ date: 1 });
    const streak = calculateBestStreak(logs.map((log) => log.date));
    if (streak > bestStreak) bestStreak = streak;
  }

  return res.json({ totalHabits, activeHabits, completedToday, bestStreak });
});

const createHabit = asyncHandler(async (req, res) => {
  const habit = await Habit.create({ ...req.body, user: req.user.id });
  return res.status(201).json(habit);
});

const updateHabit = asyncHandler(async (req, res) => {
  const habit = await Habit.findById(req.params.id);
  if (!habit) {
    return res.status(404).json({ message: "Habit not found." });
  }
  if (req.user.role !== "admin" && habit.user.toString() !== req.user.id) {
    return res.status(403).json({ message: "Forbidden." });
  }

  Object.assign(habit, req.body);
  await habit.save();
  return res.json(habit);
});

const deleteHabit = asyncHandler(async (req, res) => {
  const habit = await Habit.findById(req.params.id);
  if (!habit) {
    return res.status(404).json({ message: "Habit not found." });
  }
  if (req.user.role !== "admin" && habit.user.toString() !== req.user.id) {
    return res.status(403).json({ message: "Forbidden." });
  }

  await HabitLog.deleteMany({ habit: habit._id });
  await habit.deleteOne();
  return res.json({ message: "Habit deleted." });
});

const listLogs = asyncHandler(async (req, res) => {
  const habit = await Habit.findById(req.params.id);
  if (!habit) {
    return res.status(404).json({ message: "Habit not found." });
  }
  if (req.user.role !== "admin" && habit.user.toString() !== req.user.id) {
    return res.status(403).json({ message: "Forbidden." });
  }

  const logs = await HabitLog.find({ habit: habit._id }).sort({ date: -1 });
  return res.json(logs);
});

const createLog = asyncHandler(async (req, res) => {
  const habit = await Habit.findById(req.params.id);
  if (!habit) {
    return res.status(404).json({ message: "Habit not found." });
  }
  if (req.user.role !== "admin" && habit.user.toString() !== req.user.id) {
    return res.status(403).json({ message: "Forbidden." });
  }

  const log = await HabitLog.create({
    ...req.body,
    habit: habit._id,
    user: habit.user,
  });
  return res.status(201).json(log);
});

const deleteLog = asyncHandler(async (req, res) => {
  const log = await HabitLog.findById(req.params.logId);
  if (!log) {
    return res.status(404).json({ message: "Log not found." });
  }
  if (req.user.role !== "admin" && log.user.toString() !== req.user.id) {
    return res.status(403).json({ message: "Forbidden." });
  }

  await log.deleteOne();
  return res.json({ message: "Log deleted." });
});

module.exports = {
  listHabits,
  getStats,
  createHabit,
  updateHabit,
  deleteHabit,
  listLogs,
  createLog,
  deleteLog,
};

function calculateBestStreak(dates) {
  const unique = new Set(
    dates.map((d) => {
      const day = new Date(d);
      return day.toISOString().slice(0, 10);
    })
  );
  const sorted = Array.from(unique).sort();
  let best = 0;
  let current = 0;
  let prev = null;
  for (const day of sorted) {
    if (!prev) {
      current = 1;
    } else {
      const prevDate = new Date(prev);
      const currDate = new Date(day);
      const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);
      if (diffDays === 1) {
        current += 1;
      } else {
        current = 1;
      }
    }
    if (current > best) best = current;
    prev = day;
  }
  return best;
}
