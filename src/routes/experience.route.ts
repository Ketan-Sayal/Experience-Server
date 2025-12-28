import { Router } from "express";
import { adminMiddleware, isLoggedIn } from "../middlewares/auth.middleware.js";
import { creatBookings, createExperience, deleteExperience, getAllExperiences, getDetailsOfExperience, getExperienceByPages, handlePayment, searchExperiences, updateExperience, validatePayment, validatePromo } from "../controllers/experience.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/").get(getAllExperiences);

router.route("/create").post(adminMiddleware, upload.single("pic"), createExperience)

router.route("/:id").get(getDetailsOfExperience);

router.route("/bookings").post(isLoggedIn, creatBookings);

router.route("/promo/validate").post(isLoggedIn, validatePromo);

router.route("/limit/experiences").get(getExperienceByPages);

router.route("/payment/order").post(isLoggedIn, handlePayment);

router.route("/order/validate").post(isLoggedIn, validatePayment);

router.route("/search/all").get(searchExperiences);

router.route("/delete/:_id").delete(adminMiddleware, deleteExperience);

router.route("/update/:_id").patch(adminMiddleware, upload.single("pic"), updateExperience);

export default router;