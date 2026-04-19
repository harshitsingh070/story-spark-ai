import { Model, Types } from "mongoose";

export interface NotificationPayload {
  userName?: string;
  title: string;
  message: string;
}

export interface INotification {
  type: "success" | "error" | "info" | "warning";
  data: NotificationPayload;
  status?: string;
  email: string;
}

export type NotificationModel = Model<INotification, object>;
