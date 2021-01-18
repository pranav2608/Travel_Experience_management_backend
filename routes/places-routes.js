const express = require("express");
const {check} = require("express-validator");
const placesControllers = require("../controllers/places-controllers");
const fileUpload = require("../middleware/file-upload");
const checkAuth = require("../middleware/check-auth");

//works same as app = express()... but it helps to add an extension /api/places to the middleware created in the app.js using use().
const router = express.Router();


router.get("/:pid",placesControllers.getPlaceById); //middleware inside places-controller.js can be here also , but folllowing MVC architecture

router.get("/user/:uid", placesControllers.getPlacesByUserId); //middleware inside places-controller.js can be here also , but folllowing MVC architecture

router.use(checkAuth);

router.post("/",
fileUpload.single("image"),
[check("title").not().isEmpty(), check("description").isLength({min:5}), check("address").not().isEmpty(), check("date").not().isEmpty()], 
placesControllers.createPlace);//middleware to create new places at /api/places

router.patch("/:pid",
[check("title").not().isEmpty(), check("description").isLength({min:5}),check("date").not().isEmpty()],
placesControllers.updatePlace);

router.delete("/:pid", placesControllers.deletePlace);

module.exports = router;