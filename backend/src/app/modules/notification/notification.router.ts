import express from "express";
import { NotificationController } from "./notification.controller";
import auth from "../../middleware/auth.middleware";
import { ENUM_USER_ROLE } from "../../../enums/user";

const router = express.Router();

router.post(
  "/create-notification",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.WRITER),
  NotificationController.createNotification
);

router.post(
  "/mark-notification-as-read",
  auth(
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.WRITER,
    ENUM_USER_ROLE.USER
  ),
  NotificationController.markNotificationAsRead
);

router.get(
  "/get-notifications-by-user-email",
  NotificationController.getNotificationsByUserEmail
);

router.get(
  "/all-notification",
  auth(
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.USER,
    ENUM_USER_ROLE.WRITER
  ),
  NotificationController.getAllNotificationsByUserEmail
);

export const NotificationRouter = router;
