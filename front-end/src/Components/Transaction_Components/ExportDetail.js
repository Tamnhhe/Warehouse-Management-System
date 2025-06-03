//Nguyễn Bảo Phi-HE173187-28/2/2025
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const ExportDetail = () => {
  const { id } = useParams();
  const [transaction, setTransaction] = useState(null);
  const navigate = useNavigate();
  // Gọi API để lấy thông tin giao dịch khi component được render

  useEffect(() => {
    axios
      .get(
        `http://localhost:9999/inventoryTransactions/getTransactionById/${id}`
      )
      .then((response) => {
        setTransaction(response.data);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy chi tiết giao dịch:", error);
      });
  }, [id]);

  if (!transaction) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="container mt-4">
      <h2>Chi tiết giao dịch</h2>
      <table className="table table-bordered">
        <tbody>
          <tr>
            <th>ID</th>
            <td>{transaction._id}</td>
          </tr>
          <tr>
            <th>Chi nhánh</th>
            <td>{transaction.branch || "Không có chi nhánh"}</td>
          </tr>

          <tr>
            <th>Loại giao dịch</th>
            <td>
              <td>
                <span className="badge bg-danger">Xuất hàng</span>
              </td>
            </td>
          </tr>
          <tr>
            <th>Ngày giao dịch</th>
            <td>
              {new Date(transaction.transactionDate).toLocaleDateString()}
            </td>
          </tr>
          <tr>
            <th>Tổng tiền</th>
            <td>{transaction.totalPrice.toLocaleString()} đ</td>
          </tr>
          <tr>
            <th>Trạng thái</th>
            <td>
              <span
                className={`badge ${
                  transaction.status === "pending"
                    ? "bg-warning"
                    : transaction.status === "completed"
                    ? "bg-success"
                    : transaction.status === "cancelled"
                    ? "bg-danger"
                    : "bg-primary"
                }`}
              >
                {transaction.status === "pending"
                  ? "Chờ xử lý"
                  : transaction.status === "completed"
                  ? "Hoàn thành"
                  : transaction.status === "cancelled"
                  ? "Từ chối"
                  : "Đã duyệt"}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* 🛒 Danh sách sản phẩm trong giao dịch */}
      <h3 className="mt-4">Danh sách sản phẩm</h3>
      <table className="table table-striped table-bordered">
        <thead>
          <tr>
            <th>#</th>
            <th>Tên sản phẩm</th>
            <th>Số lượng yêu cầu</th>
            <th>Giá</th>
          </tr>
        </thead>
        <tbody>
          {transaction.products.length > 0 ? (
            transaction.products.map((product, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  {product.supplierProductId?.product?.productName ||
                    "Không có dữ liệu"}
                </td>
                <td>{product.requestQuantity}</td>
                <td>
                  {typeof product.price === "number"
                    ? product.price.toLocaleString() + " đ"
                    : "N/A"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                Không có sản phẩm nào
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
        Quay lại
      </button>
    </div>
  );
};

export default ExportDetail;
