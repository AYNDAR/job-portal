export interface Notification {
  id: number;
  userId: string;
  message: string;
  triggerType: string;
  isRead: boolean;
  createdAt: string;
}
