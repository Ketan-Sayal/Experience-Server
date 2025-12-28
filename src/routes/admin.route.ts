import { Router } from "express";
import { getAdmin, signin, signup } from "../controllers/admin.controller.js";
import { adminMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/get").get(adminMiddleware, getAdmin);
router.route("/signup").post(signup);
router.route("/signin").post(signin);

export default router;