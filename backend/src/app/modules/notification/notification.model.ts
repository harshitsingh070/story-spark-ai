import { model, Schema } from "mongoose";
import {
  INotification,
  NotificationModel,
  NotificationPayload,
} from "./notification.interface";
import { ENUM_NOTIFICATION_STATUS } from "./notification.utils";

const NotificationPayloadSchema = new Schema<NotificationPayload>({
  title: { type: String, required: true },
  message: { type: String, required: true },
  userName: { type: String, required: false },
});

const NotificationSchema: Schema<INotification> = new Schema<
  INotification,
  NotificationModel
>(
  {
    email: { type: String, required: true },
    data: { type: NotificationPayloadSchema, required: true },
    status: {
      type: String,
      enum: Object.values(ENUM_NOTIFICATION_STATUS),
      default: ENUM_NOTIFICATION_STATUS.UNREAD,
    },
    type: { type: String, required: false },
  },
  { timestamps: true }
);

export const Notification = model<INotification, NotificationModel>(
  "Notification",
  NotificationSchema
);
