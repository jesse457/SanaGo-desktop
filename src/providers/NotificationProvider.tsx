// providers/NotificationProvider.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthProvider";
import { apiClient } from "../services/authService";

// Define the shape of a notification
export interface NotificationItem {
  id: string;
  read_at: string | null;
  created_at: string;
  type: string;
  data: {
    title?: string;
    message: string;
    link?: string;
    patient_name?: string;
    [key: string]: any;
  };
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  latestNotification: NotificationItem | null;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, token } = useAuth();
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [latestNotification, setLatestNotification] = useState<NotificationItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  const audioRef = useRef(new Audio("/sounds/notification.mp3"));

  // 1. Fetch Historical Data (Offline support)
  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      console.log("🔄 Fetching notifications from Database...");
      
      const [res, countRes] = await Promise.all([
        apiClient.get("/notifications"),
        apiClient.get("/notifications/unread-count")
      ]);

      // --- LOGGING DATABASE DATA ---
      console.groupCollapsed("📂 [DATABASE SYNC] Notification Data");
      console.log("Raw API Response:", res.data);
      console.log("Raw Unread Count:", countRes.data);
      
      // Map database response to our Interface
      const mappedNotifications: NotificationItem[] = (res.data.data || []).map((n: any) => ({
        id: n.id,
        read_at: n.read_at,
        created_at: n.created_at,
        type: n.data.type || 'system',
        data: n.data
      }));

      console.log("✅ Mapped Notifications State:", mappedNotifications);
      console.groupEnd();
      // -----------------------------

      setNotifications(mappedNotifications);
      setUnreadCount(countRes.data.count || 0);
    } catch (err) {
      console.error("❌ Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // 2. Initial Load & Re-fetch on Network Recovery
  useEffect(() => {
    loadData();

    // If user comes back online, fetch what they missed
    const handleOnline = () => {
        console.log("🌐 Network restored, re-syncing notifications...");
        loadData();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [loadData]);

  // 3. Setup WebSocket Listener (Live Support)
  useEffect(() => {
    const userId = user?.id;
    if (!userId || !token || !window.Echo) return;

    const channelName = `App.Models.User.${userId}`;
    console.log(`📡 Attempting to listen on channel: ${channelName}`);
    
    const channel = window.Echo.private(channelName);

    const notificationHandler = (notification: any) => {
      // --- LOGGING WEBSOCKET DATA ---
      console.group("⚡ [LIVE WEBSOCKET] Notification Received");
      console.log("Raw Broadcast Payload:", notification);

      // Normalize Broadcast data to match Database structure
      const newItem: NotificationItem = {
        id: notification.id,
        read_at: null,
        created_at: notification.created_at || new Date().toISOString(),
        type: notification.data?.type || notification.type || 'system',
        data: {
            title: notification.data?.title || notification.title,
            message: notification.data?.message || notification.message,
            link: notification.data?.link || notification.link,
            patient_name: notification.data?.patient_name || notification.patient_name,
            // Capture any other extra fields from the notification data
            ...notification.data,
            ...notification
        }
      };

      console.log("✅ Normalized New Item:", newItem);
      console.groupEnd();
      // ------------------------------

      // Deduplicate notifications to prevent duplicates
      setNotifications(prev => {
        if (prev.some(n => n.id === newItem.id)) {
          console.log("🔍 Notification already exists, skipping duplicate");
          return prev;
        }
        return [newItem, ...prev];
      });
      
      setUnreadCount(prev => prev + 1);
      
      // Trigger Modal
      setLatestNotification(newItem);
      setShowModal(true);
      
      // Play Sound
      audioRef.current.play()
        .then(() => console.log("🔊 Sound played successfully"))
        .catch(e => console.warn("🔇 Audio play blocked (user interaction required)", e));

      // Auto-hide modal
      setTimeout(() => setShowModal(false), 6000);
    };

    channel.notification(notificationHandler);

    return () => {
      console.log(`❌ Leaving channel: ${channelName}`);
      window.Echo.leave(channelName);
    };
  }, [user?.id, token]);

  // --- Actions ---

  const markAsRead = async (id: string) => {
    // Optimistic Update
    console.log(`👀 Marking notification ${id} as read`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    try {
      await apiClient.post(`/notifications/${id}/mark-read`);
    } catch (e) {
      console.error("❌ Failed to mark read on server", e);
    }
  };

  const markAllAsRead = async () => {
    console.log("👀 Marking ALL as read");
    setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
    setUnreadCount(0);
    try {
      await apiClient.post("/notifications/mark-all-read");
    } catch (e) {
      console.error("❌ Failed to mark all as read on server", e);
      // Revert changes if there's an error
      loadData();
    }
  };

  const deleteNotification = async (id: string) => {
    console.log(`🗑️ Deleting notification ${id}`);
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await apiClient.delete(`/notifications/${id}`);
    } catch (e) {
      console.error("❌ Failed to delete notification on server", e);
      // Revert changes if there's an error
      loadData();
    }
  };

  return (
    <NotificationContext.Provider value={{ 
        notifications, unreadCount, latestNotification, 
        showModal, setShowModal, markAsRead, markAllAsRead, deleteNotification,
        loading
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
};