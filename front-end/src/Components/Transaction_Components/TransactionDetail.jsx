//Nguyễn Bảo Phi-HE173187-28/2/2025
import React, { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import html2pdf from "html2pdf.js";
import "./InvoiceStyles.css";
import useTransaction from "../../Hooks/useTransaction";

const DetailTransaction = () => {
  const { id } = useParams();
  const { transaction, loading, getTransactionById } = useTransaction();
  const navigate = useNavigate();
  const invoiceRef = useRef();

  useEffect(() => {
    getTransactionById(id);
    // eslint-disable-next-line
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = invoiceRef.current;
    const opt = {
      margin: 0.5,
      filename: `invoice-${transaction?._id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  if (loading || !transaction) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="container my-4 invoice-container">
      <div ref={invoiceRef} className="invoice-box">
        <div className="header d-flex justify-content-between align-items-center">
          <div>
            <h1 className="text-primary">
              {transaction.transactionType === "import" ? "HÓA ĐƠN NHẬP HÀNG" : "HÓA ĐƠN XUẤT HÀNG"}
            </h1>
            <p><strong>Ngày lập:</strong> {new Date(transaction.transactionDate).toLocaleDateString()}</p>
            <p><strong>Mã hóa đơn:</strong> {transaction._id}</p>
            <p><strong>Trạng thái:</strong> {transaction.status}</p>
          </div>
          <div className="text-end">
            <h5>CÔNG TY TNHH ABC</h5>
            <p>123 Đường Chính, Hà Nội</p>
            <p>hotro@abc.vn</p>
          </div>
        </div>

        <div className="section my-4">
          <h5>Thông tin người xử lý:</h5>
          <p><strong>Họ tên:</strong> {transaction.operator?.fullName || "Huy Tâm"}</p>
        </div>

        <div className="section my-4">
          <h5>Thông tin nhà cung cấp:</h5>
          <p><strong>Tên NCC:</strong> {transaction.supplier?.name || "Không có"}</p>
          <p><strong>Địa chỉ:</strong> {transaction.supplier?.address || "Không có"}</p>
          <p><strong>Email:</strong> {transaction.supplier?.email || "Không có"}</p>
          <p><strong>SĐT:</strong> {transaction.supplier?.contact || "Không có"}</p>
        </div>
        {transaction.transactionType === "export" && (
          <div className="section my-4">
            <h5>Thông tin chi nhánh nhận:</h5>
            <p><strong>Chi nhánh:</strong> {transaction.branch || "Không xác định"}</p>
          </div>
        )}

        <div className="section my-4">
          <h5>Thông tin người tạo đơn:</h5>
          <p><strong>Họ tên:</strong> {transaction.operator?.fullName || "Không xác định"}</p>
          {transaction.operator?.profile?.phoneNumber && (
            <p><strong>Số điện thoại:</strong> {transaction.operator.profile.phoneNumber}</p>
          )}
          {transaction.operator?.account?.email && (
            <p><strong>Email:</strong> {transaction.operator.account.email}</p>
          )}
        </div>

        {/* Thông tin người rà soát (chỉ hiển thị nếu đã có người rà soát) */}
        {transaction.reviewedBy && (
          <div className="section my-4">
            <h5>Thông tin người rà soát:</h5>
            <p><strong>Họ tên:</strong> {transaction.reviewedBy?.fullName || "Không xác định"}</p>
            {transaction.reviewedBy?.profile?.phoneNumber && (
              <p><strong>Số điện thoại:</strong> {transaction.reviewedBy.profile.phoneNumber}</p>
            )}
            {transaction.reviewedBy?.account?.email && (
              <p><strong>Email:</strong> {transaction.reviewedBy.account.email}</p>
            )}
            {transaction.reviewedAt && (
              <p><strong>Thời gian rà soát:</strong> {new Date(transaction.reviewedAt).toLocaleString('vi-VN')}</p>
            )}
          </div>
        )}

        <table className="table table-bordered text-center">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Tên sản phẩm</th>
              <th>SL yêu cầu</th>
              <th>SL nhận</th>
              <th>SL lỗi</th>
              <th>SL đạt</th>
              <th>Giá nhập</th>
              <th>Thành tiền</th>
              <th>Hạn sử dụng</th>
            </tr>
          </thead>
          <tbody>
            {transaction.products.map((product, index) => {
              const total = product.price * product.achievedProduct;
              return (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{product.supplierProductId?.productName || "--"}</td>
                  <td>{product.requestQuantity}</td>
                  <td>{product.receiveQuantity}</td>
                  <td>{product.defectiveProduct}</td>
                  <td>{product.achievedProduct}</td>
                  <td>{product.price.toLocaleString()} đ</td>
                  <td>{total.toLocaleString()} đ</td>
                  <td>
                    {product.expiry
                      ? new Date(product.expiry).toLocaleDateString()
                      : "N/A"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="text-end mt-4">
          <h4><strong>TỔNG TIỀN:</strong> {transaction.totalPrice.toLocaleString()} đ</h4>
        </div>

        <div className="mt-5">
          <p><strong>Ghi chú:</strong></p>
          <p className="text-muted">
            Hóa đơn này được tạo dựa trên thông tin hệ thống. Vui lòng kiểm tra kỹ trước khi in hoặc lưu trữ. Mọi sai sót xin liên hệ với quản trị viên.
          </p>
        </div>
      </div>

      <div className="d-flex gap-3 mt-4">
        <Button variant="secondary" onClick={() => navigate(-1)}>Quay lại</Button>
        <Button variant="primary" onClick={handlePrint}>In hóa đơn</Button>
        <Button variant="success" onClick={handleDownload}>Tải xuống PDF</Button>
      </div>
    </div>
  );
};

export default DetailTransaction;