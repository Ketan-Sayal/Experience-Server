import { Router } from "express";
import { getUserData, getUserPurchases, signin, signup } from "../controllers/user.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/signup").post(signup);
router.route("/signin").post(signin);
router.route("/user/data").get(isLoggedIn, getUserData);
router.route("/user/purchases").get(isLoggedIn, getUserPurchases);

export default router;