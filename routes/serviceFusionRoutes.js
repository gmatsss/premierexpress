const express = require("express");
const router = express.Router();
const {
  getWaitingForPartsJobs,
  getJobsByStatusName,
} = require("../controller/serviceFusionController");

router.get("/jobs", getWaitingForPartsJobs);

router.get("/bystatus", getJobsByStatusName);

module.exports = router;
