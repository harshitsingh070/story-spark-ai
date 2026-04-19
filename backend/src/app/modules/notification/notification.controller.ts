import { Request, Response } from "express";
import { NotificationService } from "./notification.service";
import { routeParam } from "../../../shared/route_param";
import catchAsync from "../../../shared/catch_async";
import sendResponse from "../../../shared/send_response";
import httpStatus from "http-status";
import { getToken } from "../../middleware/token";

const createNotification = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationService.createNotification(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notification created successfully!",
    data: result,
  });
});

const getNotificationsByUserEmail = catchAsync(
  async (req: Request, res: Response) => {
    const { email } = req.query;
    const result = await NotificationService.getNotificationsByUserEmail(
      email as string
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Notifications fetched successfully!",
      data: result,
    });
  }
);

const getAllNotificationsByUserEmail = catchAsync(
  async (req: Request, res: Response) => {
    const token = await getToken(req);
    const { email } = token;
    const result = await NotificationService.getAllNotificationsByUserEmail(
      email
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Notifications fetched successfully!",
      data: result,
    });
  }
);

const markNotificationAsRead = catchAsync(
  async (req: Request, res: Response) => {
    const notificationId = routeParam(req.params.notificationId);
    const result = await NotificationService.markNotificationAsRead(
      notificationId
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Notifications fetched successfully!",
      data: result,
    });
  }
);

export const NotificationController = {
  createNotification,
  getNotificationsByUserEmail,
  getAllNotificationsByUserEmail,
  markNotificationAsRead,
};
