require("dotenv").config();
const { connectDB } = require("./config/db");
const { app } = require("./app");

const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API running on port ${PORT}`);
    });
  })
  .catch((error) => {
    const uri = process.env.MONGODB_URI || "";
    const isLocalMongo =
      uri.includes("127.0.0.1") || uri.includes("localhost");

    if (isLocalMongo && process.env.NODE_ENV === "production") {
      console.error(
        "Failed to start server: MONGODB_URI points to local MongoDB. " +
          "Use a cloud database URI (MongoDB Atlas or Render Mongo) in Render environment variables."
      );
    } else {
      console.error("Failed to start server:", error.message);
    }
    process.exit(1);
  });
