const express = require("express");
const apiController = require("../controllers/api.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(protect);

router
  .route("/projects/:projectId/apis")
  .get(apiController.listApiDocs)
  .post(apiController.createApiDoc);

router
  .route("/apis/:id")
  .get(apiController.getApiDoc)
  .put(apiController.updateApiDoc)
  .delete(apiController.deleteApiDoc);

module.exports = router;
