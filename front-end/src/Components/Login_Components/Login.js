import React, { useState } from "react";
import { FaEnvelope, FaLock, FaFacebookF, FaGoogle, FaLinkedinIn } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);

    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Replace with your actual API call
      /*
      const response = await axios.post(
        "http://localhost:9999/authentication/login",
        { email, password }
      );
      if (response.data) {
        const { token } = response.data;
        // Note: localStorage not available in artifacts
        // localStorage.setItem("authToken", token);
        setSuccess(true);
        setTimeout(() => navigate("/product"), 500);
      }
      */
      
      // Demo success
      setSuccess(true);
      setTimeout(() => {
        console.log("Redirecting to product page...");
      }, 500);
    } catch (err) {
      setError("Đăng nhập thất bại!");
    }
  };

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setError("");
    setSuccess(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f6f5f7',
      fontFamily: 'Montserrat, sans-serif',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css?family=Montserrat:400,800');
        
        .login-container {
          background-color: #fff;
          border-radius: 10px;
          box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
          position: relative;
          overflow: hidden;
          width: 768px;
          max-width: calc(100vw - 40px);
          min-height: 480px;
          max-height: calc(100vh - 40px);
          font-family: 'Montserrat', sans-serif;
        }

        .form-container {
          position: absolute;
          top: 0;
          height: 100%;
          transition: all 0.6s ease-in-out;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 50px;
          text-align: center;
        }

        .sign-in-container {
          left: 0;
          width: 50%;
          z-index: 2;
          background-color: #FFFFFF;
        }

        .sign-up-container {
          left: 0;
          width: 50%;
          opacity: 0;
          z-index: 1;
          background-color: #FFFFFF;
        }

        .login-container.right-panel-active .sign-in-container {
          transform: translateX(100%);
        }

        .login-container.right-panel-active .sign-up-container {
          transform: translateX(100%);
          opacity: 1;
          z-index: 5;
          animation: show 0.6s;
        }

        @keyframes show {
          0%, 49.99% {
            opacity: 0;
            z-index: 1;
          }
          50%, 100% {
            opacity: 1;
            z-index: 5;
          }
        }

        .overlay-container {
          position: absolute;
          top: 0;
          left: 50%;
          width: 50%;
          height: 100%;
          overflow: hidden;
          transition: transform 0.6s ease-in-out;
          z-index: 100;
        }

        .login-container.right-panel-active .overlay-container {
          transform: translateX(-100%);
        }

        .overlay {
          background: #48C1A6;
          background: linear-gradient(135deg, #48C1A6, #36A085);
          background-repeat: no-repeat;
          background-size: cover;
          background-position: 0 0;
          color: #FFFFFF;
          position: relative;
          left: -100%;
          height: 100%;
          width: 200%;
          transform: translateX(0);
          transition: transform 0.6s ease-in-out;
        }

        .login-container.right-panel-active .overlay {
          transform: translateX(50%);
        }

        .overlay-panel {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 40px;
          text-align: center;
          top: 0;
          height: 100%;
          width: 50%;
          transform: translateX(0);
          transition: transform 0.6s ease-in-out;
        }

        .overlay-left {
          transform: translateX(-20%);
        }

        .login-container.right-panel-active .overlay-left {
          transform: translateX(0);
        }

        .overlay-right {
          right: 0;
          transform: translateX(0);
        }

        .login-container.right-panel-active .overlay-right {
          transform: translateX(20%);
        }

        .social-container {
          margin: 20px 0;
        }

        .social {
          border: 1px solid #DDDDDD;
          border-radius: 50%;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          margin: 0 5px;
          height: 40px;
          width: 40px;
          text-decoration: none;
          color: #333;
          transition: all 0.3s ease;
        }

        .social:hover {
          background-color: #48C1A6;
          color: white;
          border-color: #48C1A6;
        }

        .form-input {
          background-color: #eee;
          border: none;
          padding: 12px 15px;
          margin: 8px 0;
          width: 100%;
          border-radius: 5px;
          font-size: 14px;
        }

        .form-input:focus {
          outline: none;
          background-color: #ddd;
        }

        .btn-primary {
          border-radius: 20px;
          border: 1px solid #48C1A6;
          background-color: #48C1A6;
          color: #FFFFFF;
          font-size: 12px;
          font-weight: bold;
          padding: 12px 45px;
          letter-spacing: 1px;
          text-transform: uppercase;
          transition: transform 80ms ease-in;
          cursor: pointer;
        }

        .btn-primary:active {
          transform: scale(0.95);
        }

        .btn-primary:hover {
          background-color: #36A085;
          border-color: #36A085;
        }

        .btn-ghost {
          background-color: transparent;
          border: 1px solid #FFFFFF;
          color: #FFFFFF;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          padding: 12px 45px;
          letter-spacing: 1px;
          text-transform: uppercase;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .btn-ghost:hover {
          background-color: #FFFFFF;
          color: #48C1A6;
        }

        .forgot-password {
          color: #333;
          font-size: 14px;
          text-decoration: none;
          margin: 15px 0;
        }

        .forgot-password:hover {
          color: #48C1A6;
        }

        .alert {
          padding: 10px;
          margin: 10px 0;
          border-radius: 5px;
          font-size: 14px;
        }

        .alert-danger {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .alert-success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        h1 {
          font-weight: bold;
          margin: 0;
          font-size: 24px;
        }

        p {
          font-size: 14px;
          font-weight: 100;
          line-height: 20px;
          letter-spacing: 0.5px;
          margin: 20px 0 30px;
        }

        span {
          font-size: 12px;
          color: #666;
          margin: 10px 0;
        }
      `}</style>

      <div className={`login-container ${isSignUp ? 'right-panel-active' : ''}`}>
        {/* Sign In Form */}
        <div className="form-container sign-in-container">
          <div>
            <h1>Đăng nhập</h1>
            <div className="social-container">
              <div className="social">
                <FaFacebookF />
              </div>
              <div className="social">
                <FaGoogle />
              </div>
              <div className="social">
                <FaLinkedinIn />
              </div>
            </div>
            <span>hoặc sử dụng tài khoản của bạn</span>
            
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">Đăng nhập thành công!</div>}
            
            <input
              type="email"
              placeholder="Email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="forgot-password" style={{ cursor: 'pointer' }}>
              Quên mật khẩu?
            </div>
            <button onClick={handleSubmit} className="btn-primary">
              Đăng nhập
            </button>
          </div>
        </div>

        {/* Sign Up Form */}
        <div className="form-container sign-up-container">
          <div>
            <h1>Tạo tài khoản</h1>
            <div className="social-container">
              <div className="social">
                <FaFacebookF />
              </div>
              <div className="social">
                <FaGoogle />
              </div>
              <div className="social">
                <FaLinkedinIn />
              </div>
            </div>
            <span>hoặc sử dụng email để đăng ký</span>
            <input type="text" placeholder="Tên" className="form-input" />
            <input type="email" placeholder="Email" className="form-input" />
            <input type="password" placeholder="Mật khẩu" className="form-input" />
            <button type="button" className="btn-primary">
              Đăng ký
            </button>
          </div>
        </div>

        {/* Overlay */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Chào mừng trở lại!</h1>
              <p>Để giữ kết nối với chúng tôi, vui lòng đăng nhập bằng thông tin cá nhân của bạn</p>
              <button className="btn-ghost" onClick={toggleSignUp}>
                Đăng nhập
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>Xin chào, bạn!</h1>
              <p>Nhập thông tin cá nhân của bạn và bắt đầu hành trình với chúng tôi</p>
              <button className="btn-ghost" onClick={toggleSignUp}>
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
//login register aaa
export default Login;