//Nguyễn Bảo Phi-HE173187-28/2/2025
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import html2pdf from "html2pdf.js";
import "./InvoiceStyles.css";

const ExportDetail = () => {
  const { id } = useParams();
  const [transaction, setTransaction] = useState(null);
  const navigate = useNavigate();
  const invoiceRef = useRef();

  useEffect(() => {
    axios
      .get(`http://localhost:9999/inventoryTransactions/getTransactionById/${id}`)
      .then((response) => setTransaction(response.data))
      .catch((error) => console.error("Lỗi khi lấy chi tiết giao dịch:", error));
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = invoiceRef.current;
    const opt = {
      margin: 0.5,
      filename: `export-invoice-${transaction?._id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  if (!transaction) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="container my-4 invoice-container">
      <div ref={invoiceRef} className="invoice-box">
        <div className="header d-flex justify-content-between align-items-center">
          <div>
            <h1 className="text-danger">HÓA ĐƠN XUẤT HÀNG</h1>
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
          <h5>Thông tin chi nhánh xuất hàng:</h5>
          <p><strong>Chi nhánh:</strong> {transaction.branch || "Không xác định"}</p>
        </div>

        <div className="section my-4">
          <h5>Người thực hiện:</h5>
          <p><strong>Họ tên:</strong> {transaction.operator?.fullName || "Chưa rõ"}</p>
        </div>

        <table className="table table-bordered text-center">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Tên sản phẩm</th>
              <th>SL yêu cầu</th>
              <th>SL xuất</th>
              <th>Giá</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {transaction.products.map((product, index) => {
              const total = product.price * product.achievedProduct;
              return (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{product.supplierProductId?.product?.productName || "--"}</td>
                  <td>{product.requestQuantity}</td>
                  <td>{product.achievedProduct}</td>
                  <td>{product.price.toLocaleString()} đ</td>
                  <td>{total.toLocaleString()} đ</td>
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
            Hóa đơn này được tạo cho giao dịch xuất kho. Vui lòng xác nhận lại số lượng và giá trước khi ký nhận.
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

export default ExportDetail;
