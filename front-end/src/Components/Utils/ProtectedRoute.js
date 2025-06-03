import { jwtDecode } from 'jwt-decode';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const checkTokenExpiration = () => {
    const token = localStorage.getItem('authToken');
    if (token) {
        const { exp } = jwtDecode(token);
        if (Date.now() >= exp * 1000) {
            localStorage.removeItem('authToken');
            return true; // Token hết hạn
        }
    }
    return false; // Token hợp lệ
};

const ProtectedRoute = ({ children, allowedRoles }) => {
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");
    const [hasAlerted, setHasAlerted] = useState(false); // Tránh lặp alert

    useEffect(() => {
        if (!token || checkTokenExpiration()) {
            if (!hasAlerted) {
                alert('Token đã hết hạn, vui lòng đăng nhập lại');
                setHasAlerted(true);
            }
            navigate('/login', { replace: true });
        } else {
            try {
                const decodedToken = jwtDecode(token);
                const userRole = decodedToken.role;

                if (!allowedRoles.includes(userRole)) {
                    alert('Ko có quyền');
                    navigate('/product');
                }
            } catch (error) {
                console.error('Invalid token:', error);
                localStorage.removeItem('authToken');
                navigate('/login', { replace: true });
            }
        }
    }, [token, allowedRoles, navigate, hasAlerted]);

    if (!token || checkTokenExpiration()) return null;
    try {
        const decodedToken = jwtDecode(token);
        if (!allowedRoles.includes(decodedToken.role)) return null;
    } catch {
        return null;
    }

    return children;
};

export default ProtectedRoute;
