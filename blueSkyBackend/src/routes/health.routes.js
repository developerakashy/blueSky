import { Router } from "express";
import { healthz } from "../controllers/healthz.controllers.js";

const router = Router()

router.route('/').get(healthz)

export default router
