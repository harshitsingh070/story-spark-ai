import express from "express";
import { VerifyEmailController } from "./verify_email.controller";
const router = express.Router();

// Verify email
router.post("/verify-email", VerifyEmailController.VerifyEmail);

export const VerifyEmailRouter = router;
