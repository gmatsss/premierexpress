const express = require("express");
const router = express.Router();
const homeController = require("../controller/homeController");

router.get("/", homeController.getHome);
router.get("/about", homeController.getAbout);

module.exports = router;
