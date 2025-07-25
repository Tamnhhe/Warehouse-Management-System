import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  matchPath,
  Navigate,
} from "react-router-dom";
import ProtectedRoute from "./Components/Utils/ProtectedRoute";
import ForgotPassword from "./Components/Login_Components/ForgotPassword";
import Login from "./Components/Login_Components/Login";
import ResetPassword from "./Components/Login_Components/ResetPassword";
import ConfirmAccount from "./Components/Login_Components/ConfirmAccount";
import CreateEmployee from "./Components/Manager_Components/CreateEmployee";
// 恢复import ProductWarehouse
import ProductWarehouse from "./Components/Warehouse_Components/ProductWarehouse";
import ViewProfile from "./Components/User_Components/ViewProfile";
import EditProfile from "./Components/User_Components/EditProfile";
import ChangePassword from "./Components/User_Components/ChangePassword";
import ExportProduct from "./Components/Transaction_Components/ExportProduct";
import ExportProductList from "./Components/Transaction_Components/ExportProductList";
import CreateReceipt from "./Components/Transaction_Components/CreateReceipt";
import ListTransaction from "./Components/Transaction_Components/ListTransaction";
import DetailTransaction from "./Components/Transaction_Components/TransactionDetail";
import EditTransaction from "./Components/Transaction_Components/EditTransaction";
import Dashboard from "./Components/DashBoard_Components/DashBoard";
import ListAllUsers from "./Components/Manager_Components/ListAllUsers";
import Header from "./Components/Utils/Header";
import ListCategory from "./Components/Category_Components/ListCategory.jsx";
// Bỏ import Sidebar vì không dùng nữa
// import Sidebar from "./Components/Utils/Sidebar";
import ProductList from "./Components/Product_Components/ProductList";
import SupplierList from "./Components/Supplier_Components/SupplierList";
import AddNewSuppliers from "./Components/Supplier_Components/AddNewSupplier";
import EditSuppliers from "./Components/Supplier_Components/EditSuppliers";
import ManageSupplierProducts from "./Components/Supplier_Components/ManageSupplierProducts";
import AddCategory from "./Components/Category_Components/AddCategory";
import Landing from "./Components/Utils/Landing";
import ExportDetail from "./Components/Transaction_Components/ExportDetail";
import Register from "./Components/Login_Components/Register";
import { Container } from "@mui/material"; // Import Container từ MUI
import ListReceipts from "./Components/Transaction_Components/ListReceipts";
import InventoryCheck from "./Components/Inventory_Components/InventoryCheck";
import Stocktaking from "./Components/Inventory_Components/Stocktaking";
// Layout component đã được đơn giản hóa
import VerifyEmail from "./Components/Login_Components/VerifyEmail";
import { jwtDecode } from "jwt-decode";
import AIInventoryHub from "./Components/Inventory_Components/AIInventoryHub";

// Context
import { NotyfProvider } from "./Contexts/NotyfContext";
import { NotificationProvider } from "./contexts/NotificationProvider";
import { DataRefreshProvider } from "./Hooks/useDataRefresh"; // Thêm import này

// Layout component
const Layout = ({ children }) => {
  const location = useLocation();
  const hidePaths = [
    "/login",
    "/register",
    "/forgot-password",
    "/verify/:token",
    "/resetPassword/:id/:token",
    "/verify-email/:user/:token",
    "/",
  ];

  const shouldHide = hidePaths.some((path) =>
    matchPath(path, location.pathname)
  );

  // Nếu là trang không cần Header, chỉ render nội dung trang
  if (shouldHide) {
    return <>{children}</>;
  }

  // Nếu là trang cần Header, render Header và nội dung bên dưới
  return (
    <>
      <Header />
      {/* Bọc nội dung trang trong một Container của MUI để có khoảng cách và căn lề đẹp */}
      <Container maxWidth={false} sx={{ mt: 4, mb: 4 }}>
        {children}
      </Container>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppWithAuth />
    </Router>
  );
}

function AppWithAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Lấy user info từ localStorage hoặc token
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUser({
          id: decodedToken.id || decodedToken._id,
          role: decodedToken.role,
          branchId: decodedToken.branchId,
          username: decodedToken.username,
          fullName: decodedToken.fullName,
        });
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem("authToken");
      }
    }
  }, []);

  return (
    <DataRefreshProvider>
      <NotificationProvider user={user}>
        <Layout>
          <Routes>
            {/* Các Routes vẫn giữ nguyên không thay đổi */}
            <Route
              path="/"
              element={
                <ProtectedRoute
                  allowedRoles={["employee", "manager"]}
                  redirectTo="/login"
                >
                  <Landing />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify/:token" element={<ConfirmAccount />} />
            <Route path="/resetPassword/:id/:token" element={<ResetPassword />} />

            {/* Các route yêu cầu đăng nhập */}
            <Route
              path="/manager/create-employee"
              element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <CreateEmployee />
                </ProtectedRoute>
              }
            />
            <Route
              path="/product"
              element={
                <ProtectedRoute allowedRoles={["employee", "manager"]}>
                  <ProductList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/view-profile"
              element={
                <ProtectedRoute allowedRoles={["employee", "manager"]}>
                  <ViewProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-profile"
              element={
                <ProtectedRoute allowedRoles={["employee", "manager"]}>
                  <EditProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/change-password"
              element={
                <ProtectedRoute allowedRoles={["employee", "manager"]}>
                  <ChangePassword />
                </ProtectedRoute>
              }
            />
            <Route
              path="/export-product"
              element={
                <ProtectedRoute allowedRoles={["employee", "manager"]}>
                  <ExportProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/export"
              element={
                <ProtectedRoute allowedRoles={["employee", "manager"]}>
                  <ExportProductList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/export-list"
              element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <ExportProductList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/receipts"
              element={
                <ProtectedRoute allowedRoles={["manager", "employee"]}>
                  {/* 确保 ListReceipts 组件正确导入 */}
                  <ListReceipts />
                </ProtectedRoute>
              }
            />

            <Route
              path="/receipt/create"
              element={
                <ProtectedRoute allowedRoles={["manager", "employee"]}>
                  <CreateReceipt />
                </ProtectedRoute>
              }
            />

            <Route
              path="/list-transaction"
              element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <ListTransaction />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transaction/:id"
              element={
                <ProtectedRoute allowedRoles={["manager", "employee"]}>
                  <DetailTransaction />
                </ProtectedRoute>
              }
            />
            <Route
              path="/export-detail/:id"
              element={
                <ProtectedRoute allowedRoles={["manager", "employee"]}>
                  <ExportDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-transaction/:id"
              element={
                <ProtectedRoute allowedRoles={["manager", "employee"]}> {/* ✅ CHO PHÉP CẢ EMPLOYEE VÀ MANAGER */}
                  <EditTransaction />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/get-all-user"
              element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <ListAllUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/category"
              element={
                <ProtectedRoute allowedRoles={["employee", "manager"]}>
                  <ListCategory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/get-list-suppliers"
              element={
                <ProtectedRoute allowedRoles={["employee", "manager"]}>
                  <SupplierList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/add-suppliers"
              element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <AddNewSuppliers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/edit-suppliers"
              element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <EditSuppliers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/manage-supplier-products"
              element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <ManageSupplierProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/category/add-category"
              element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <AddCategory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory-check"
              element={
                <ProtectedRoute allowedRoles={["manager", "employee"]}>
                  <InventoryCheck />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stocktaking"
              element={
                <ProtectedRoute allowedRoles={["manager", "employee"]}>
                  <Stocktaking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* 添加仓库货架管理路由 */}
            <Route
              path="/warehouse"
              element={
                <ProtectedRoute allowedRoles={["manager", "employee"]}>
                  <ProductWarehouse />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-inventory-hub"
              element={
                <ProtectedRoute allowedRoles={["manager", "employee"]}>
                  <AIInventoryHub />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </NotificationProvider>
    </DataRefreshProvider>
  );
}

export default App;
