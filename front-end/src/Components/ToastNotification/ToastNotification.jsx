import React, { useEffect, useState } from 'react';
import './ToastNotification.css';

const ToastNotification = ({ notification, onClose, duration = 5000 }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Show animation
        const showTimer = setTimeout(() => setIsVisible(true), 10);
        
        // Auto close timer
        const closeTimer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => {
            clearTimeout(showTimer);
            clearTimeout(closeTimer);
        };
    }, [duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onClose();
        }, 300); // Wait for exit animation
    };

    const getToastIcon = (type) => {
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
            case 'success':
                return '✅';
            case 'warning':
                return '⚠️';
            case 'error':
                return '❌';
            case 'info':
                return 'ℹ️';
            default:
                return '🔔';
        }
    };

    const getToastColor = (type) => {
        switch (type) {
            case 'success':
            case 'manager_approval':
                return 'success';
            case 'warning':
            case 'stock_alert':
                return 'warning';
            case 'error':
                return 'error';
            case 'info':
            case 'system':
                return 'info';
            default:
                return 'default';
        }
    };

    if (!notification) return null;

    return (
        <div 
            className={`toast-notification ${getToastColor(notification.type)} ${isVisible ? 'visible' : ''} ${isExiting ? 'exiting' : ''}`}
        >
            <div className="toast-icon">
                {getToastIcon(notification.type)}
            </div>
            
            <div className="toast-content">
                <div className="toast-title">
                    {notification.title}
                </div>
                <div className="toast-message">
                    {notification.message}
                </div>
                {notification.createdAt && (
                    <div className="toast-time">
                        {new Date(notification.createdAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                )}
            </div>

            <button 
                className="toast-close"
                onClick={handleClose}
                aria-label="Đóng thông báo"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>

            <div className="toast-progress">
                <div 
                    className="toast-progress-bar" 
                    style={{ animationDuration: `${duration}ms` }}
                ></div>
            </div>
        </div>
    );
};

export default ToastNotification;