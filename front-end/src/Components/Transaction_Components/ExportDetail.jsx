//Nguyễn Bảo Phi-HE173187-28/2/2025
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import html2pdf from "html2pdf.js";
import "./InvoiceStyles.css";
import useTransaction from "../../Hooks/useTransaction";

const ExportDetail = () => {
  const { id } = useParams();
  const [transaction, setTransaction] = useState(null);
  const navigate = useNavigate();
  const invoiceRef = useRef();
  const { getTransactionById } = useTransaction();

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await getTransactionById(id);
        if (response && response.data) {
          setTransaction(response.data);
          console.log("Transaction data:", response.data);
          console.log("Products:", response.data.products);
        }
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết giao dịch:", error);
      }
    };

    fetchTransaction();
  }, [id, getTransactionById]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = invoiceRef.current;
    const opt = {
      margin: 0.5,
      filename: `phieu-xuat-kho-${transaction?._id}.pdf`,
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
            <h1 className="text-primary">PHIẾU XUẤT KHO</h1>
            <p>
              <strong>Ngày lập:</strong>{" "}
              {new Date(transaction.transactionDate).toLocaleDateString()}
            </p>
            <p>
              <strong>Mã hóa đơn:</strong> {transaction._id}
            </p>
            <p>
              <strong>Trạng thái:</strong>{" "}
              <span
                className={`badge ${transaction.status === "pending"
                  ? "bg-warning"
                  : transaction.status === "completed"
                    ? "bg-success"
                    : "bg-danger"
                  }`}
              >
                {transaction.status === "pending" && "Chờ xử lý"}
                {transaction.status === "completed" && "Hoàn thành"}
                {transaction.status === "cancelled" && "Từ chối"}
              </span>
            </p>
          </div>
          <div className="text-end">
            <h5>Movico </h5>
            <p>123 Đường Chính, Hà Nội</p>
            <p>support@movico.com</p>
          </div>
        </div>

        <div className="section my-4">
          <h5>Thông tin chi nhánh xuất hàng:</h5>
          {transaction.branch && typeof transaction.branch === "object" ? (
            <>
              <p><strong>Chi nhánh:</strong> {transaction.branch.name || "Không xác định"}</p>
              {transaction.branch.receiver && <p><strong>Người nhận:</strong> {transaction.branch.receiver}</p>}
              {transaction.branch.address && <p><strong>Địa chỉ:</strong> {transaction.branch.address}</p>}
              {transaction.branch.phone && <p><strong>SĐT:</strong> {transaction.branch.phone}</p>}
              {transaction.branch.email && <p><strong>Email:</strong> {transaction.branch.email}</p>}
            </>
          ) : (
            <p><strong>Chi nhánh:</strong> {typeof transaction.branch === "string" ? transaction.branch : "Không xác định"}</p>
          )}
        </div>

        <div className="section my-4">
          <h5>Người thực hiện:</h5>
          <p>
            <strong>Họ tên:</strong>{" "}
            {transaction.operator?.fullName || "Chưa rõ"}
          </p>
        </div>

        <table className="table table-bordered text-center">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Tên sản phẩm</th>
              <th>SL yêu cầu</th>
              <th>SL xuất</th>
              <th>Giá xuất</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {transaction.products.map((product, index) => {
              // Ưu tiên lấy giá xuất từ exportPrice, nếu không có thì lấy price
              const price = typeof product.exportPrice === "number"
                ? product.exportPrice
                : (typeof product.price === "number" ? product.price : 0);
              const qty = typeof product.requestQuantity === "number" ? product.requestQuantity : 0;
              return (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    {product.productId && typeof product.productId === "object"
                      ? product.productId.productName || product.productId.name || "--"
                      : typeof product.productId === "string"
                        ? product.productId
                        : product.supplierProductId && typeof product.supplierProductId === "object"
                          ? product.supplierProductId.productName || product.supplierProductId.name || "--"
                          : typeof product.supplierProductId === "string"
                            ? product.supplierProductId
                            : "--"}
                  </td>
                  <td>{typeof product.requestQuantity === "number" ? product.requestQuantity : "--"}</td>
                  <td>{typeof product.achievedProduct === "number" ? product.achievedProduct : "--"}</td>
                  <td>{price.toLocaleString("vi-VN")} VND</td>
                  <td>{(price * qty).toLocaleString("vi-VN")} VND</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Tổng giá trị phiếu xuất */}
        <div className="mt-3 text-end">
          <h5>
            Tổng giá trị phiếu xuất: {transaction.products.reduce((sum, p) => sum + (typeof p.price === "number" ? p.price : 0) * (typeof p.requestQuantity === "number" ? p.requestQuantity : 0), 0).toLocaleString("vi-VN")} VND
          </h5>
        </div>

        <div className="mt-5">
          <p>
            <strong>Ghi chú:</strong>
          </p>
          <p className="text-muted">
            Phiếu này được tạo cho giao dịch xuất kho. Vui lòng xác nhận lại số
            lượng trước khi ký nhận.
          </p>
        </div>
      </div>

      <div className="d-flex flex-wrap gap-3 mt-4">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Quay lại
        </Button>
        <Button variant="primary" onClick={handlePrint}>
          In phiếu xuất
        </Button>
        <Button variant="success" onClick={handleDownload}>
          Tải xuống PDF
        </Button>
      </div>
    </div>
  );
};

export default ExportDetail;
