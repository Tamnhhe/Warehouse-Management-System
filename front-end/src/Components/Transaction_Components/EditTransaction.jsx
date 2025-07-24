//Nguyễn Bảo Phi-HE173187-28/2/2025
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
// <-- KHU VỰC THAY ĐỔI: Import thêm component từ react-bootstrap -->
import { Form, Button, Card, Row, Col, Alert } from "react-bootstrap";

const EditTransaction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ products: [] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); // ✅ THÊM: Loading state

  // ✅ THÊM: Hàm lấy token từ localStorage
  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken'); // ✅ SỬA: Đổi từ 'token' thành 'authToken'
    console.log('🔍 DEBUG - Token from localStorage:', token); // Debug log
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    console.log('🔍 DEBUG - Making request to:', `http://localhost:9999/inventoryTransactions/getTransactionById/${id}`);
    console.log('🔍 DEBUG - Headers:', getAuthHeaders());

    axios
      .get(`http://localhost:9999/inventoryTransactions/getTransactionById/${id}`, {
        headers: getAuthHeaders() // ✅ THÊM: Headers với token
      })
      .then((res) => {
        console.log("✅ Transaction data loaded successfully:", res.data); // Debug log
        if (res.data?.products) {
          setFormData({
            products: res.data.products.map((p) => ({
              supplierProductId: p.supplierProductId?._id || null,
              // ✅ SỬA: Lấy tên sản phẩm từ supplierProductId.productName
              productName: p.supplierProductId?.productName || "Không có tên",
              requestQuantity: p.requestQuantity ?? 0,
              receiveQuantity: p.receiveQuantity ?? 0,
              defectiveProduct: p.defectiveProduct ?? 0,
              achievedProduct: p.achievedProduct ?? 0,
              price: p.price ?? 0,
              expiry: p.expiry ? new Date(p.expiry).toISOString().split("T")[0] : "",
            })),
            // ✅ THÊM: Thêm thông tin người xử lý vào formData
            operator: res.data.operator || null,
            reviewedBy: res.data.reviewedBy || null, // ✅ THÊM: Thêm thông tin người rà soát
            reviewedAt: res.data.reviewedAt || null, // ✅ THÊM: Thêm thời gian rà soát
          });
        }
      })
      .catch((err) => {
        console.error("❌ Error details:", {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          headers: err.response?.headers
        });

        if (err.response?.status === 401 || err.response?.status === 403) {
          // ✅ SỬA: Chỉ hiển thị lỗi, không tự động logout
          setError("Không thể tải dữ liệu giao dịch. Vui lòng kiểm tra quyền truy cập hoặc đăng nhập lại.");
        } else {
          setError("Không thể tải dữ liệu giao dịch. Vui lòng thử lại.");
        }
      })
      .finally(() => setLoading(false)); // ✅ THÊM: Đặt loading thành false sau khi hoàn thành gọi API
  }, [id, navigate]);

  // <-- KHU VỰC THAY ĐỔI LỚN: Cập nhật hàm handleChange để tự động tính toán -->
  const handleChange = (e, index, field) => {
    const { value } = e.target;

    setFormData((prev) => {
      const updatedProducts = [...prev.products];
      const productToUpdate = { ...updatedProducts[index] };

      // Cập nhật giá trị cho trường đang được thay đổi
      if (field === "expiry") {
        productToUpdate[field] = value;
      } else if (field === "price") {
        // ✅ THÊM: Validation cho giá nhập phải > 0
        const numericValue = value === "" ? "" : parseFloat(value);
        if (numericValue <= 0 && numericValue !== "") {
          return prev; // Không cập nhật nếu giá <= 0
        }
        productToUpdate[field] = numericValue;
      } else {
        // Xử lý cho các trường số khác
        const numericValue = value === "" ? "" : Math.max(0, Number(value.replace(/^0+(?=\d)/, "")));
        productToUpdate[field] = numericValue;
      }

      // Tự động tính toán "Số lượng lỗi" khi "Số lượng đạt" hoặc "Số lượng nhận" thay đổi
      if (field === 'achievedProduct' || field === 'receiveQuantity') {
        const receiveQty = (field === 'receiveQuantity') ? Number(productToUpdate.receiveQuantity) : Number(productToUpdate.receiveQuantity);
        const achievedQty = (field === 'achievedProduct') ? Number(productToUpdate.achievedProduct) : Number(productToUpdate.achievedProduct);

        // Đảm bảo số lượng đạt không lớn hơn số lượng nhận
        if (achievedQty > receiveQty) {
          productToUpdate.achievedProduct = receiveQty; // Giới hạn giá trị
          productToUpdate.defectiveProduct = 0;
        } else {
          productToUpdate.defectiveProduct = Math.max(0, receiveQty - achievedQty);
        }
      }

      updatedProducts[index] = productToUpdate;
      return { products: updatedProducts };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); // Reset lỗi

    // ✅ THÊM: Kiểm tra giá nhập phải lớn hơn 0
    const priceValidationError = formData.products.find(
      (p) => !p.price || Number(p.price) <= 0
    );

    if (priceValidationError) {
      setError(`Giá nhập của sản phẩm "${priceValidationError.productName}" phải lớn hơn 0.`);
      return;
    }

    const validationError = formData.products.find(
      (p) => Number(p.defectiveProduct) + Number(p.achievedProduct) !== Number(p.receiveQuantity)
    );

    if (validationError) {
      setError(`Lỗi dữ liệu ở sản phẩm "${validationError.productName}". Tổng số lượng Đạt và Lỗi không bằng Số lượng nhận.`);
      return;
    }

    axios
      .put(`http://localhost:9999/inventoryTransactions/updateTransaction/${id}`, formData, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders() // ✅ THÊM: Headers với token
        },
      })
      .then(() => {
        alert("Cập nhật thành công!");
        navigate("/receipts");
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        } else {
          setError("Lỗi khi cập nhật: " + (err.response?.data?.message || err.message));
        }
      });
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>; // ✅ THÊM: Hiển thị loading
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Rà soát sản phẩm trong phiếu nhập</h2>



      <Form onSubmit={handleSubmit}>
        {error && <Alert variant="danger">{error}</Alert>}

        {/* GIAO DIỆN BẢNG CHO DESKTOP */}
        <div className="d-none d-md-block table-responsive">
          <table className="table table-bordered align-middle">
            <thead className="table-light">
              <tr>
                <th>Tên sản phẩm</th>
                <th>SL Yêu cầu</th>
                <th>SL Nhận</th>
                <th>SL Đạt</th>
                <th>SL Lỗi (Tự động)</th>
                <th>Giá nhập</th>
                <th>Ngày hết hạn</th>
              </tr>
            </thead>
            <tbody>
              {formData.products.map((product, index) => (
                <tr key={index}>
                  <td>{product.productName}</td>
                  <td><Form.Control type="number" value={product.requestQuantity} readOnly disabled /></td>
                  <td><Form.Control type="number" value={product.receiveQuantity} onChange={(e) => handleChange(e, index, "receiveQuantity")} /></td>
                  <td><Form.Control type="number" value={product.achievedProduct} onChange={(e) => handleChange(e, index, "achievedProduct")} /></td>
                  <td><Form.Control type="number" value={product.defectiveProduct} readOnly /></td>
                  <td><Form.Control
                    type="number"
                    value={product.price}
                    onChange={(e) => handleChange(e, index, "price")}
                    min="0.01"
                    step="0.01"
                  /></td>
                  <td><Form.Control type="date" value={product.expiry} onChange={(e) => handleChange(e, index, "expiry")} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* GIAO DIỆN CARD CHO MOBILE */}
        <div className="d-md-none">
          {formData.products.map((product, index) => (
            <Card key={index} className="mb-3">
              <Card.Header as="h5">{product.productName}</Card.Header>
              <Card.Body>
                <Form.Group as={Row} className="mb-2" controlId={`req-${index}`}>
                  <Form.Label column sm="5">SL Yêu cầu</Form.Label>
                  <Col sm="7"><Form.Control type="number" value={product.requestQuantity} readOnly disabled /></Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-2" controlId={`rec-${index}`}>
                  <Form.Label column sm="5">SL Nhận</Form.Label>
                  <Col sm="7"><Form.Control type="number" value={product.receiveQuantity} onChange={(e) => handleChange(e, index, "receiveQuantity")} /></Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-2" controlId={`ach-${index}`}>
                  <Form.Label column sm="5">SL Đạt</Form.Label>
                  <Col sm="7"><Form.Control type="number" value={product.achievedProduct} onChange={(e) => handleChange(e, index, "achievedProduct")} /></Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-2" controlId={`def-${index}`}>
                  <Form.Label column sm="5">SL Lỗi</Form.Label>
                  <Col sm="7"><Form.Control type="number" value={product.defectiveProduct} readOnly /></Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-2" controlId={`price-${index}`}>
                  <Form.Label column sm="5">Giá nhập</Form.Label>
                  <Col sm="7"><Form.Control
                    type="number"
                    value={product.price}
                    onChange={(e) => handleChange(e, index, "price")}
                    min="0.01"
                    step="0.01"
                  /></Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-2" controlId={`exp-${index}`}>
                  <Form.Label column sm="5">Hết hạn</Form.Label>
                  <Col sm="7"><Form.Control type="date" value={product.expiry} onChange={(e) => handleChange(e, index, "expiry")} /></Col>
                </Form.Group>
              </Card.Body>
            </Card>
          ))}
        </div>

        <div className="mt-4">
          <Button type="submit" variant="primary">Lưu thay đổi</Button>
          <Button type="button" variant="secondary" className="ms-2" onClick={() => navigate("/list-transaction")}>Quay lại</Button>
        </div>
      </Form>
    </div>
  );
};

export default EditTransaction;