import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import socketService from '../services/socketService';
import notificationService from '../services/notificationService';
import ToastNotification from '../components/ToastNotification/ToastNotification';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children, user }) => {
    const [toasts, setToasts] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);

    // Fetch notifications khi component mount
    useEffect(() => {
        if (user && user.id) {
            fetchNotifications();
            fetchUnreadCount();
        }
    }, [user]);

    // Socket connection effect
    useEffect(() => {
        if (user && user.id) {
            // Kết nối Socket.IO
            const socket = socketService.connect(user);
            
            // Set initial connection status
            setIsConnected(socketService.isSocketConnected());

            // Listen for connection changes
            const handleConnection = () => {
                setIsConnected(true);
                console.log('🟢 Socket connected - refreshing notifications');
                fetchNotifications();
                fetchUnreadCount();
            };

            const handleDisconnection = (reason) => {
                setIsConnected(false);
                console.log('🔴 Socket disconnected:', reason);
            };

            // Add connection listeners
            socketService.onConnectionChange(handleConnection);
            socketService.onDisconnection(handleDisconnection);

            // Listen for new notifications
            socketService.onNewNotification((notification) => {
                console.log('Received new notification:', notification);
                
                // Thêm vào danh sách notifications
                addNewNotification(notification);
                
                // Hiển thị toast
                showToast(notification);
            });

            return () => {
                socketService.offNewNotification();
                socketService.offConnectionChange(handleConnection);
                socketService.offDisconnection(handleDisconnection);
                socketService.disconnect();
                setIsConnected(false);
            };
        }
    }, [user]);

    const fetchNotifications = useCallback(async () => {
        if (!user?.id) return;
        
        try {
            const response = await notificationService.getUserNotifications(user.id, 1, 20);
            if (response.success) {
                setNotifications(response.data.notifications || []);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }, [user?.id]);

    const fetchUnreadCount = useCallback(async () => {
        if (!user?.id) return;
        
        try {
            const count = await notificationService.getUnreadCount(user.id);
            setUnreadCount(count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    }, [user?.id]);

    const addNewNotification = useCallback((notification) => {
        setNotifications(prev => [notification, ...prev.slice(0, 19)]); // Giữ tối đa 20 thông báo
        setUnreadCount(prev => prev + 1);
    }, []);

    const markAsRead = useCallback(async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);
            setNotifications(prev => 
                prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        if (!user?.id) return;
        
        try {
            await notificationService.markAllAsRead(user.id);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }, [user?.id]);

    const showToast = useCallback((notification) => {
        const toastId = Date.now() + Math.random();
        const toast = {
            id: toastId,
            ...notification
        };

        setToasts(prev => [...prev, toast]);

        // Auto remove toast after duration
        setTimeout(() => {
            removeToast(toastId);
        }, 6000); // 6 seconds
    }, []);

    const removeToast = useCallback((toastId) => {
        setToasts(prev => prev.filter(toast => toast.id !== toastId));
    }, []);

    const value = {
        // Socket connection state
        isConnected,
        
        // Notifications state
        notifications,
        unreadCount,
        
        // Toast functions
        showToast,
        removeToast,
        
        // Notification functions
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        addNewNotification,
        
        // Socket utilities
        reconnectSocket: socketService.reconnect.bind(socketService),
        getConnectionInfo: socketService.getConnectionInfo.bind(socketService),
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}

            {/* Toast container */}
            <div className="toast-container">
                {toasts.map((toast) => (
                    <ToastNotification
                        key={toast.id}
                        notification={toast}
                        onClose={() => removeToast(toast.id)}
                        duration={5000}
                    />
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

export default NotificationProvider;