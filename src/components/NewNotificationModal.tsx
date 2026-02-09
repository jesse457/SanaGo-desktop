// components/NewNotificationModal.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, Info } from "lucide-react";
import { NotificationItem } from "../providers/NotificationProvider";
import { useNavigate } from "react-router-dom";

export const NewNotificationModal = ({ 
    show, 
    notification, 
    onClose 
}: { 
    show: boolean, 
    notification: NotificationItem | null, 
    onClose: () => void 
}) => {
  const navigate = useNavigate();
  
  if (!notification) return null;

  const handleViewDetails = () => {
    if (notification.data.link) {
      navigate(notification.data.link);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          className="fixed bottom-6 right-6 z-[999] w-[320px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-2xl overflow-hidden"
        >
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Bell size={16} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">New Alert</span>
              </div>
              <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                <X size={16} />
              </button>
            </div>
            
            <div className="mt-3">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {notification.data.title || "System Notification"}
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                {notification.data.message}
              </p>
            </div>

            <div className="mt-4 flex gap-2">
              <button 
                onClick={onClose}
                className="flex-1 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold uppercase rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                Dismiss
              </button>
              {notification.data.link && (
                <button 
                  onClick={handleViewDetails}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-[10px] font-bold uppercase rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all"
                >
                  View Details
                </button>
              )}
            </div>
          </div>
          <motion.div 
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 6, ease: "linear" }}
            className="h-1 bg-blue-500"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};