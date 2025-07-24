import { jwtDecode } from 'jwt-decode';
import { useNavigate, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const checkTokenExpiration = () => {
    const token = localStorage.getItem('authToken');
    if (token) {
        try {
            const { exp } = jwtDecode(token);
            const currentTime = Date.now() / 1000;

            // ✅ THÊM: Kiểm tra nếu token sắp hết hạn trong 30 phút tới
            const timeUntilExpiry = exp - currentTime;
            if (timeUntilExpiry < 1800) { // 30 phút = 1800 seconds
                console.warn('⚠️ Token sắp hết hạn trong 30 phút');
                // Có thể thêm logic refresh token tại đây
            }

            if (currentTime >= exp) {
                console.warn('🚨 Token đã hết hạn');
                localStorage.removeItem('authToken');
                return true; // Token hết hạn
            }
        } catch (error) {
            console.error('Invalid token format:', error);
            localStorage.removeItem('authToken');
            return true;
        }
    }
    return !token; // Token không tồn tại hoặc hợp lệ
};

const ProtectedRoute = ({ children, allowedRoles, redirectTo = '/login' }) => {
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            if (!token || checkTokenExpiration()) {
                setIsAuthenticated(false);
                setIsLoading(false);
                return;
            }

            try {
                const decodedToken = jwtDecode(token);
                const userRole = decodedToken.role;

                if (!allowedRoles.includes(userRole)) {
                    // Người dùng đăng nhập nhưng không có quyền truy cập
                    setIsAuthenticated(false);
                } else {
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Invalid token:', error);
                localStorage.removeItem('authToken');
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [token, allowedRoles]);

    if (isLoading) {
        return <div>Đang kiểm tra quyền truy cập...</div>;
    }

    return isAuthenticated ? children : <Navigate to={redirectTo} replace />;
};

export default ProtectedRoute;
