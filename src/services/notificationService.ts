import { apiClient } from "./authService"; // Using your existing apiClient

export const notificationService = {
  // Get all notifications
  getAll: () => apiClient.get("/notifications"),
  
  // Get unread count
  getUnreadCount: () => apiClient.get("/notifications/unread-count"),
  
  // Mark one as read
  markAsRead: (id: string) => apiClient.post(`/notifications/${id}/mark-read`),
  
  // Mark all as read
  markAllRead: () => apiClient.post("/notifications/mark-all-read"),
  
  // Delete
  delete: (id: string) => apiClient.delete(`/notifications/${id}`),
};