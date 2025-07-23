import React from 'react';
import { useNotification } from '../../contexts/NotificationProvider';
import './NotificationDemo.css';

const NotificationDemo = () => {
    const { 
        showToast, 
        isConnected, 
        unreadCount, 
        getConnectionInfo,
        reconnectSocket 
    } = useNotification();

    const testNotifications = [
        {
            type: 'success',
            title: 'Thành công!',
            message: 'Thao tác đã được thực hiện thành công.',
            createdAt: new Date().toISOString()
        },
        {
            type: 'warning',
            title: 'Cảnh báo tồn kho',
            message: 'Sản phẩm iPhone 16 Pro Max sắp hết hàng (còn 5 sản phẩm).',
            createdAt: new Date().toISOString()
        },
        {
            type: 'error',
            title: 'Lỗi hệ thống',
            message: 'Không thể kết nối đến server. Vui lòng thử lại sau.',
            createdAt: new Date().toISOString()
        },
        {
            type: 'inventory_update',
            title: 'Cập nhật kho hàng',
            message: 'Đã nhập 100 sản phẩm iPhone 16 Pro Max vào kho chi nhánh Hà Nội.',
            createdAt: new Date().toISOString()
        },
        {
            type: 'manager_approval',
            title: 'Yêu cầu phê duyệt',
            message: 'Có 1 yêu cầu xuất kho cần phê duyệt từ nhân viên Nguyễn Văn A.',
            createdAt: new Date().toISOString()
        },
        {
            type: 'transaction',
            title: 'Giao dịch mới',
            message: 'Đã hoàn thành giao dịch bán hàng #GD001 với tổng giá trị 25,000,000 VNĐ.',
            createdAt: new Date().toISOString()
        }
    ];

    const handleTestNotification = (notification) => {
        showToast(notification);
    };

    const handleTestAllTypes = () => {
        testNotifications.forEach((notification, index) => {
            setTimeout(() => {
                showToast(notification);
            }, index * 1000); // Delay 1 second between each notification
        });
    };

    const connectionInfo = getConnectionInfo();

    return (
        <div className="notification-demo">
            <div className="demo-header">
                <h2>🔔 Demo Hệ Thống Thông Báo</h2>
                <p>Test các loại thông báo và kiểm tra kết nối Socket.IO</p>
            </div>

            <div className="connection-status">
                <h3>📡 Trạng Thái Kết Nối</h3>
                <div className="status-grid">
                    <div className={`status-item ${isConnected ? 'connected' : 'disconnected'}`}>
                        <span className="status-label">Socket:</span>
                        <span className="status-value">{isConnected ? '🟢 Đã kết nối' : '🔴 Ngắt kết nối'}</span>
                    </div>
                    <div className="status-item">
                        <span className="status-label">Thông báo chưa đọc:</span>
                        <span className="status-value">{unreadCount}</span>
                    </div>
                    <div className="status-item">
                        <span className="status-label">Thử kết nối lại:</span>
                        <span className="status-value">{connectionInfo.reconnectAttempts}/{connectionInfo.maxReconnectAttempts}</span>
                    </div>
                </div>
                
                {!isConnected && (
                    <button className="reconnect-btn" onClick={reconnectSocket}>
                        🔄 Kết nối lại
                    </button>
                )}
            </div>

            <div className="demo-actions">
                <h3>🧪 Test Thông Báo</h3>
                <div className="action-grid">
                    {testNotifications.map((notification, index) => (
                        <button
                            key={index}
                            className={`demo-btn ${notification.type}`}
                            onClick={() => handleTestNotification(notification)}
                        >
                            <span className="btn-icon">
                                {notification.type === 'success' && '✅'}
                                {notification.type === 'warning' && '⚠️'}
                                {notification.type === 'error' && '❌'}
                                {notification.type === 'inventory_update' && '📦'}
                                {notification.type === 'manager_approval' && '👤'}
                                {notification.type === 'transaction' && '💰'}
                            </span>
                            <span className="btn-text">{notification.title}</span>
                        </button>
                    ))}
                </div>
                
                <button className="demo-btn-all" onClick={handleTestAllTypes}>
                    🎯 Test Tất Cả (Delay 1s)
                </button>
            </div>

            <div className="demo-info">
                <h3>💡 Hướng Dẫn Sử Dụng</h3>
                <ul>
                    <li><strong>NotificationBell:</strong> Click vào icon chuông ở header để xem danh sách thông báo</li>
                    <li><strong>Toast Notifications:</strong> Thông báo popup sẽ tự động hiện và biến mất sau 5 giây</li>
                    <li><strong>Real-time:</strong> Thông báo mới sẽ tự động hiện khi có socket events</li>
                    <li><strong>Connection Status:</strong> Kiểm tra trạng thái kết nối và reconnect tự động</li>
                    <li><strong>Mark as Read:</strong> Click vào thông báo để đánh dấu đã đọc</li>
                </ul>
            </div>

            <div className="demo-technical">
                <h3>⚙️ Thông Tin Kỹ Thuật</h3>
                <pre className="connection-info">
                    {JSON.stringify(connectionInfo, null, 2)}
                </pre>
            </div>
        </div>
    );
};

export default NotificationDemo;