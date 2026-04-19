import { ITokenPayload } from "../../../interfaces/token";
import { INotification } from "./notification.interface";
import { Notification } from "./notification.model";

const createNotification = async (payload: INotification) => {
  const notification = await Notification.create(payload);
  return notification;
};

const getNotificationsByUserEmail = async (email: string) => {
  const notifications = await Notification.find({
    email,
    status: "unread",
  }).sort({
    createdAt: -1,
  });
  return notifications;
};

const getAllNotificationsByUserEmail = async (email: string) => {
  const notifications = await Notification.find({
    email,
  }).sort({
    createdAt: -1,
  });
  return notifications;
};

const markNotificationAsRead = async (notificationId: string) => {
  const notification = await Notification.findByIdAndUpdate(
    notificationId,
    { status: "read" },
    { new: true }
  );
  return notification;
};

export const NotificationService = {
  createNotification,
  getNotificationsByUserEmail,
  markNotificationAsRead,
  getAllNotificationsByUserEmail
};
