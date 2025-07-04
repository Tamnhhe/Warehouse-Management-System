//Nguyễn Bảo Phi-HE173187-7/2/2025
import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Row,
  Col,
  Container,
  Alert,
  Table,
  Modal,
} from "react-bootstrap";
import { BsEye } from "react-icons/bs";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ExportProduct = () => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);
  const [branch, setBranch] = useState("Chi nhánh A");
  const [selectQuantity, setSelectQuantity] = useState(0);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:9999/supplierProducts/getAllSupplierProducts")
      .then((response) => {
        const supplierProducts = response.data;

        const priceMap = {};
        const quantityMap = {};

        supplierProducts.forEach((item) => {
          const productId = item.product?._id;
          const quantity = item.stock ?? 0; // ✅ dùng stock thay vì totalStock
          const price = item.price ?? 0;

          if (!productId) return;

          priceMap[productId] = (priceMap[productId] || 0) + price * quantity;
          quantityMap[productId] = (quantityMap[productId] || 0) + quantity;
        });
        const activeProducts = supplierProducts.filter(
          (item) => item.product?.status === "active"
        );
        const supplierProductsWithAvg = activeProducts.map((item) => {
          const productId = item.product?._id;
          const avgPrice =
            quantityMap[productId] > 0
              ? Math.round(priceMap[productId] / quantityMap[productId])
              : 0;

          return {
            ...item,
            avgPrice: avgPrice, // ✅ bây giờ avgPrice sẽ chính xác
          };
        });

        console.log("✅ Có avgPrice:", supplierProductsWithAvg);

        setProducts(supplierProductsWithAvg);
      })
      .catch((error) => {
        console.error("Lỗi khi gọi API:", error);
      });
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:9999/categories/getAllCategories")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Không tải được danh mục", err));
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (value.trim() === "") {
      setFilteredProducts([]);
      return;
    }

    const filtered = products.filter(
      (p) =>
        p.product &&
        p.product.productName &&
        p.product.productName.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleSelectProduct = (product) => {
    if (!selectedProducts.some((p) => p._id === product._id)) {
      setSelectedProducts([
        ...selectedProducts,
        {
          ...product,
          quantity: 1,
          avgPrice: product.avgPrice || 0,
        },
      ]);
    }
    setFilteredProducts([]);
    setSearch("");
  };

  const handleQuantityChange = (index, value) => {
    if (/^\d*$/.test(value)) {
      setSelectedProducts((prev) =>
        prev.map((p, i) => (i === index ? { ...p, quantity: value } : p))
      );
    }
  };

  const getCategoryName = (categoryId) => {
    const found = categories.find((c) => c._id === categoryId);
    return found ? found.categoryName : "Không có";
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts.splice(index, 1);
    setSelectedProducts(updatedProducts);
  };

  const handleSubmit = async () => {
    console.log("📦 Danh sách sản phẩm trước khi gửi API:", selectedProducts);

    if (selectedProducts.length === 0) {
      setMessage("Vui lòng chọn ít nhất một sản phẩm.");
      return;
    }

    // 🛠 Tính tổng tiền hàng chính xác
    const totalPrice = selectedProducts.reduce((acc, p) => {
      return acc + (Number(p.avgPrice) || 0) * (Number(p.quantity) || 0);
    }, 0);

    console.log("💰 Tổng tiền sau khi tính:", totalPrice);

    if (totalPrice <= 0) {
      setError("Tổng tiền không hợp lệ, kiểm tra lại sản phẩm!");
      return;
    }

    try {
      const requestData = {
        products: selectedProducts.map((p) => ({
          supplierProductId: p._id,
          productId: p.product?._id,
          requestQuantity: p.quantity,
          price: p.avgPrice * p.quantity,
        })),
        transactionType: "export",
        totalPrice: totalPrice,
        status: "pending",
        supplier: selectedProducts[0]?.supplier?._id,
        branch: branch,
      };

      console.log("📤 Dữ liệu gửi lên API:", requestData);

      const response = await axios.post(
        "http://localhost:9999/inventoryTransactions/createTransaction",
        requestData
      );

      console.log("✅ API response:", response.data);

      setMessage(response.data.message);
      setSelectedProducts([]);
    } catch (error) {
      console.error("❌ Lỗi khi tạo đơn:", error.response?.data || error);
      setError("Lỗi khi xuất kho, vui lòng thử lại.");
    }
    console.log("✅ Chọn:", selectedProducts);
    console.log("✅ Tổng tiền:", totalPrice);
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <h3 className="text-center mb-4">Tạo phiếu xuất kho </h3>
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Control
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChange={handleSearch}
            className="mb-3"
          />
          {filteredProducts.length > 0 && (
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              <Table striped bordered hover>
                <tbody>
                  {filteredProducts.map((f, index) => (
                    <tr key={index} onClick={() => handleSelectProduct(f)}>
                      <td>
                        <img
                          src={
                            f?.product.productImage
                              ? `http://localhost:9999${f?.product.productImage}`
                              : "http://localhost:9999/uploads/default-product.png"
                          }
                          width="50"
                          className="rounded"
                        />
                      </td>
                      <td>{f?.product.productName}</td>
                      <td>{(f?.avgPrice ?? 0).toLocaleString()} VND</td>
                      <td>{f?.totalStock} in stock</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
          {selectedProducts.length > 0 && (
            <Table striped bordered hover className="mt-3">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Total Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedProducts.map((s, index) => (
                  <tr key={index}>
                    <td>
                      <img
                        src={
                          s?.product.productImage
                            ? `http://localhost:9999${s?.product.productImage}`
                            : "http://localhost:9999/uploads/default-product.png"
                        }
                        width="50"
                        className="rounded"
                      />
                    </td>
                    <td>{s?.product.productName}</td>
                    <td>
                      <Form.Control
                        type="number"
                        min="1"
                        value={s.quantity}
                        onChange={(e) =>
                          handleQuantityChange(index, e.target.value)
                        }
                        onBlur={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val > 0) {
                            const updated = [...selectedProducts];
                            updated[index].quantity = val;
                            setSelectedProducts(updated);
                          }
                        }}
                      />
                    </td>
                    <td>
                      {(
                        Number(s.avgPrice || 0) * Number(s.quantity || 0)
                      ).toLocaleString("en-US")}{" "}
                      VND
                    </td>

                    <td>
                      <Button
                        variant="info"
                        className="me-2"
                        onClick={() => {
                          setModalProduct(s);
                          setShowModal(true);
                        }}
                      >
                        <BsEye size={20} />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveProduct(index)}
                      >
                        &times;
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Chi nhánh</Form.Label>
            <Form.Select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            >
              <option value="Chi nhánh A">Chi nhánh A</option>
              <option value="Chi nhánh B">Chi nhánh B</option>
              <option value="Chi nhánh C">Chi nhánh C</option>
              <option value="Chi nhánh D">Chi nhánh D</option>
            </Form.Select>
          </Form.Group>

          <div className="d-flex justify-content-between mt-3">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Back
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={selectedProducts?.length === 0}
            >
              Create Transaction
            </Button>
          </div>
          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Chi tiết sản phẩm</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {modalProduct && (
                <div className="product-details">
                  <div className="product-info">
                    <p>
                      <strong>Tên sản phẩm:</strong>{" "}
                      {modalProduct.product?.productName || "Không có"}
                    </p>
                    <p>
                      <strong>Danh mục:</strong>{" "}
                      {getCategoryName(modalProduct.product?.categoryId)}
                    </p>
                    <p>
                      <strong>Giá trung bình:</strong>{" "}
                      {modalProduct.avgPrice?.toLocaleString() || 0} VND
                    </p>
                    <p>
                      <strong>Tồn kho từ nhà cung cấp:</strong>{" "}
                      {modalProduct.stock || 0}
                    </p>
                    <p>
                      <strong>Vị trí:</strong>{" "}
                      {modalProduct.product?.location || "Không có"}
                    </p>
                    <p>
                      <strong>Nhà cung cấp:</strong>{" "}
                      {modalProduct.supplier?.name || "Không có"}
                    </p>
                    <p>
                      <strong>Hạn sử dụng:</strong>{" "}
                      {modalProduct.expiry
                        ? new Date(modalProduct.expiry).toLocaleDateString()
                        : "Không có"}
                    </p>
                  </div>
                  <div className="product-image text-center">
                    <img
                      src={
                        modalProduct.product?.productImage
                          ? `http://localhost:9999${modalProduct.product.productImage}`
                          : "http://localhost:9999/uploads/default-product.png"
                      }
                      alt="Hình sản phẩm"
                      width="150"
                    />
                  </div>
                </div>
              )}
            </Modal.Body>
          </Modal>
        </Col>
      </Row>
    </Container>
  );
};

export default ExportProduct;
