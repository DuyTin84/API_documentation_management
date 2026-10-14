const express = require("express");
const projectController = require("../controllers/project.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(protect);

router.route("/").get(projectController.listProjects).post(projectController.createProject);
router
  .route("/:id")
  .get(projectController.getProject)
  .put(projectController.updateProject)
  .delete(projectController.deleteProject);

module.exports = router;
