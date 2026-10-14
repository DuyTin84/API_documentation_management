require("dotenv").config();

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const projectRoutes = require("./routes/project.routes");
const apiRoutes = require("./routes/api.routes");
const { notFound, errorHandler } = require("./middlewares/error.middleware");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/", (req, res) => {
  res.json({
    message: "API Documentation Management backend is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api", apiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
