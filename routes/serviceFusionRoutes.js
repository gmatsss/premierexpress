const express = require("express");
const router = express.Router();
const {
  getWaitingForPartsJobs,
  getJobsByStatusName,
  getinvoice,
} = require("../controller/serviceFusionController");
const {
  handleSpeech,
  handleAnswer,
  handleEvent,
} = require("../controller/vonageController");

router.post("/jobs", getWaitingForPartsJobs);
router.post("/getinvoice", getinvoice);
router.get("/bystatus", getJobsByStatusName);

router.post("/answer", handleAnswer);
router.post("/speech", handleSpeech);
router.post("/event", handleEvent);

module.exports = router;
