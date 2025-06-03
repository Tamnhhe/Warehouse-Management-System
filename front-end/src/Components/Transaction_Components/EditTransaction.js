//Nguyễn Bảo Phi-HE173187-28/2/2025
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EditTransaction = () => {
  const { id } = useParams(); // Lấy ID giao dịch từ URL
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ products: [] });

  // Lấy thông tin giao dịch khi component được render
  useEffect(() => {
    axios
      .get(
        `http://localhost:9999/inventoryTransactions/getTransactionById/${id}`
      )
      .then((res) => {
        if (res.data?.products) {
          setFormData({
            products: res.data.products.map((p) => ({
              supplierProductId: p.supplierProductId?._id || null,
              productName:
                p.supplierProductId?.product?.productName || "Không có tên", // Lấy tên sản phẩm
              requestQuantity: p.requestQuantity ?? 0,
              receiveQuantity: p.receiveQuantity ?? 0,
              defectiveProduct: p.defectiveProduct ?? 0,
              achievedProduct: p.achievedProduct ?? 0,
              price: p.price ?? 0,
              expiry: p.expiry
                ? new Date(p.expiry).toISOString().split("T")[0]
                : "",
            })),
          });
        }
      })
      .catch((err) => console.error("Lỗi khi lấy dữ liệu:", err));
  }, [id]);

  // Xử lý thay đổi dữ liệu trong input
  const handleChange = (e, index, field) => {
    let value = e.target.value;

    // Nếu là số, đảm bảo không âm và không có số 0 ở đầu
    if (
      [
        "requestQuantity",
        "receiveQuantity",
        "defectiveProduct",
        "achievedProduct",
        "price",
      ].includes(field)
    ) {
      value = value.replace(/^0+(?=\d)/, ""); // Loại bỏ số 0 ở đầu
      value = value === "" ? "" : Math.max(0, Number(value));
    }

    setFormData((prev) => {
      const updatedProducts = [...prev.products];
      updatedProducts[index] = { ...updatedProducts[index], [field]: value };
      return { products: updatedProducts };
    });
  };

  // Xử lý khi người dùng bấm lưu thông tin giao dịch
  const handleSubmit = (e) => {
    e.preventDefault();

    // Kiểm tra tổng số lượng lỗi + đạt phải bằng số lượng nhận
    const isValid = formData.products.every(
      (p) => p.defectiveProduct + p.achievedProduct === p.receiveQuantity
    );

    if (!isValid) {
      alert("Tổng số lượng lỗi và số lượng đạt phải bằng số lượng nhận!");
      return;
    }

    // Kiểm tra không có giá trị âm
    const hasNegativeValues = formData.products.some(
      (p) =>
        p.requestQuantity < 0 ||
        p.receiveQuantity < 0 ||
        p.defectiveProduct < 0 ||
        p.achievedProduct < 0 ||
        p.price < 0
    );

    if (hasNegativeValues) {
      alert("Không được nhập giá trị âm!");
      return;
    }

    axios
      .put(
        `http://localhost:9999/inventoryTransactions/updateTransaction/${id}`,
        formData,
        {
          headers: { "Content-Type": "application/json" },
        }
      )
      .then((response) => {
        console.log("API Response:", response.data);
        alert("Cập nhật thành công!");
        navigate(-1);
      })
      .catch((err) =>
        console.error("Lỗi khi cập nhật:", err.response?.data || err)
      );
  };

  return (
    <div className="container mt-4">
      <h2>Chỉnh sửa sản phẩm</h2>
      <form onSubmit={handleSubmit}>
        <table className="table table-bordered mt-3">
          <thead className="table-light">
            <tr>
              <th>Tên sản phẩm</th>
              <th>Số lượng yêu cầu</th>
              <th>Số lượng nhận</th>
              <th>Số lượng lỗi</th>
              <th>Số lượng đạt</th>
              <th>Giá bán</th>
              <th>Ngày hết hạn</th>
            </tr>
          </thead>
          <tbody>
            {formData.products.map((product, index) => (
              <tr key={index}>
                <td>{product.productName}</td> {/* Hiển thị tên sản phẩm */}
                {[
                  "requestQuantity",
                  "receiveQuantity",
                  "defectiveProduct",
                  "achievedProduct",
                  "price",
                ].map((field) => (
                  <td key={field}>
                    <input
                      type="number"
                      className="form-control"
                      value={product[field]}
                      onChange={(e) => handleChange(e, index, field)}
                    />
                  </td>
                ))}
                <td>
                  <input
                    type="date"
                    className="form-control"
                    value={product.expiry}
                    onChange={(e) => handleChange(e, index, "expiry")}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button type="submit" className="btn btn-primary mt-3">
          Lưu
        </button>
        <button
          type="button"
          className="btn btn-secondary mt-3 ms-2"
          onClick={() => navigate(-1)}
        >
          Quay lại
        </button>
      </form>
    </div>
  );
};

export default EditTransaction;
