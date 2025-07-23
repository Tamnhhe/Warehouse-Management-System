import React, { useState, useEffect, useRef } from 'react';
import { useNotification } from '../../contexts/NotificationProvider';
import './NotificationBell.css';

const NotificationBell = ({ userId }) => {
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
        isConnected
    } = useNotification();
    
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleBellClick = () => {
        setShowDropdown(!showDropdown);
        
        // Refresh notifications when opening dropdown
        if (!showDropdown) {
            setLoading(true);
            fetchNotifications().finally(() => {
                setLoading(false);
            });
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }
        
        // Optional: Navigate to related page based on notification type
        // handleNavigateToNotification(notification);
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'employee_action':
                return '📝';
            case 'manager_approval':
                return '✅';
            case 'inventory_update':
                return '📦';
            case 'stock_alert':
                return '⚠️';
            case 'system':
                return '🔧';
            case 'transaction':
                return '💰';
            case 'user_management':
                return '👥';
            default:
                return '🔔';
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <div className="notification-bell-container" ref={dropdownRef}>
            <button 
                className={`notification-bell-button ${!isConnected ? 'disconnected' : ''}`} 
                onClick={handleBellClick}
                title={isConnected ? 'Thông báo' : 'Đang kết nối lại...'}
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
                {!isConnected && <span className="connection-indicator"></span>}
            </button>

            {showDropdown && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h3>Thông báo</h3>
                        <div className="header-actions">
                            {!isConnected && (
                                <span className="connection-status">Đang kết nối lại...</span>
                            )}
                            {unreadCount > 0 && (
                                <button
                                    className="mark-all-read-btn"
                                    onClick={handleMarkAllRead}
                                >
                                    Đánh dấu tất cả đã đọc
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="notification-list">
                        {loading ? (
                            <div className="notification-loading">
                                <div className="loading-spinner"></div>
                                <span>Đang tải...</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="notification-empty">
                                <div className="empty-icon">🔔</div>
                                <span>Không có thông báo nào</span>
                            </div>
                        ) : (
                            notifications.slice(0, 10).map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="notification-icon">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="notification-content">
                                        <div className="notification-title">{notification.title}</div>
                                        <div className="notification-message">{notification.message}</div>
                                        <div className="notification-time">
                                            {formatTime(notification.createdAt)}
                                        </div>
                                    </div>
                                    {!notification.isRead && <div className="unread-dot"></div>}
                                </div>
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="notification-footer">
                            <button className="view-all-btn">Xem tất cả thông báo</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;