import { Router } from "express";

import { login, changePassword } from "../controllers/auth.controller";
import { changePwd } from "../services/auth.service";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/login", login);
router.post("/changepwd", authenticate, changePassword);

export default router;
