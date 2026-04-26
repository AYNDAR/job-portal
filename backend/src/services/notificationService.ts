import { prisma } from "../config/database";
import { sendEmail } from "./emailService";

interface NotificationData {
  userId: string;
  message: string;
  triggerType: "Job" | "Application";
  emailSubject?: string;
  emailBody?: string;
}

export const createNotification = async (data: NotificationData) => {
  // Create in-app notification
  const notification = await prisma.notification.create({
    data: {
      user_id: data.userId,
      message: data.message,
      trigger_type: data.triggerType,
      is_read: false,
    },
  });

  // Send email if configured
  if (process.env.SMTP_HOST && data.emailSubject && data.emailBody) {
    try {
      const user = await prisma.user.findUnique({ where: { id: data.userId } });
      if (user?.email) {
        await sendEmail(user.email, data.emailSubject, data.emailBody);
      }
    } catch (err) {
      console.error("Email sending failed:", err);
    }
  }

  return notification;
};

export const markAsRead = async (notificationId: number, userId: string) => {
  return prisma.notification.updateMany({
    where: { id: notificationId, user_id: userId },
    data: { is_read: true },
  });
};
