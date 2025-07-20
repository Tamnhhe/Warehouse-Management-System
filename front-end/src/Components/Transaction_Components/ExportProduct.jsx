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
  Card,
} from "react-bootstrap";
import { BsEye, BsTrash } from "react-icons/bs";
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
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    // Fetch regular products instead of supplier products
    axios
      .get("http://localhost:9999/products/getAllProducts")
      .then((response) => {
        const allProducts = response.data;
        console.log("Raw products:", allProducts);

        if (!Array.isArray(allProducts) || allProducts.length === 0) {
          setError("Không tìm thấy sản phẩm");
          setLoading(false);
          return;
        }

        // Filter active products
        const activeProducts = allProducts.filter(
          (product) => product && product.status === "active"
        );

        console.log("Active products count:", activeProducts.length);

        // Process products data
        const productsWithData = activeProducts.map((product) => {
          return {
            ...product,
            stock: product.stock || 0,
          };
        });

        console.log("Products with data:", productsWithData);
        setProducts(productsWithData);
      })
      .catch((error) => {
        console.error("Lỗi khi gọi API:", error);
        setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");
      })
      .finally(() => {
        setLoading(false);
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
        p &&
        p.productName &&
        p.productName.toLowerCase().includes(value.toLowerCase())
    );

    console.log("Filtered products:", filtered);
    setFilteredProducts(filtered);
  };

  const handleSelectProduct = (product) => {
    if (!selectedProducts.some((p) => p._id === product._id)) {
      setSelectedProducts([
        ...selectedProducts,
        {
          ...product,
          quantity: 1,
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
      setError("Vui lòng chọn ít nhất một sản phẩm.");
      return;
    }

    try {
      // Chuẩn bị dữ liệu gửi đi
      const requestData = {
        products: selectedProducts.map((p) => ({
          productId: p._id,
          requestQuantity: parseInt(p.quantity, 10) || 1,
        })),
        transactionType: "export",
        status: "pending",
        branch: branch,
      };

      console.log(
        "📤 Dữ liệu gửi lên API:",
        JSON.stringify(requestData, null, 2)
      );

      const response = await axios.post(
        "http://localhost:9999/inventoryTransactions/createTransaction",
        requestData
      );

      console.log("✅ API response:", response.data);

      setMessage("Phiếu xuất kho đã được tạo thành công!");
      setSelectedProducts([]);
      setError("");
    } catch (error) {
      console.error("❌ Error details:", error);

      if (error.response) {
        console.error("❌ Response data:", error.response.data);
        console.error("❌ Response status:", error.response.status);
        setError(
          error.response.data.message || "Lỗi khi xuất kho, vui lòng thử lại."
        );
      } else if (error.request) {
        console.error("❌ Request was made but no response received");
        setError(
          "Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng."
        );
      } else {
        console.error("❌ Error setting up request:", error.message);
        setError("Lỗi khi tạo yêu cầu: " + error.message);
      }
    }
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-primary text-white">
              <h4 className="my-2 text-center">Tạo phiếu xuất kho</h4>
            </Card.Header>
            <Card.Body>
              {message && <Alert variant="success">{message}</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}

              {loading ? (
                <div className="text-center p-5">
                  <p>Đang tải sản phẩm...</p>
                </div>
              ) : (
                <Row>
                  <Col md={6} className="mb-3">
                    <h5>Tìm kiếm sản phẩm</h5>
                    <Form.Control
                      type="text"
                      placeholder="Nhập tên sản phẩm..."
                      value={search}
                      onChange={handleSearch}
                      className="mb-3"
                    />

                    {filteredProducts.length > 0 && (
                      <div
                        style={{ maxHeight: "400px", overflowY: "auto" }}
                        className="border rounded"
                      >
                        <Table hover borderless className="mb-0">
                          <thead className="bg-light">
                            <tr>
                              <th style={{ width: "60px" }}></th>
                              <th>Tên sản phẩm</th>
                              <th>Tồn kho</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredProducts.map((product, index) => (
                              <tr
                                key={index}
                                onClick={() => handleSelectProduct(product)}
                                style={{ cursor: "pointer" }}
                              >
                                <td>
                                  <img
                                    src={
                                      product?.productImage
                                        ? `http://localhost:9999${product?.productImage}`
                                        : "http://localhost:9999/uploads/default-product.png"
                                    }
                                    width="50"
                                    height="50"
                                    className="rounded object-fit-cover"
                                    alt={product?.productName}
                                  />
                                </td>
                                <td>{product?.productName}</td>
                                <td>{product?.stock} sản phẩm</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    )}
                  </Col>

                  <Col md={6}>
                    <h5>Sản phẩm xuất kho</h5>

                    {selectedProducts.length === 0 ? (
                      <div className="text-center p-5 border rounded">
                        <p className="text-muted">
                          Chưa có sản phẩm nào được chọn
                        </p>
                      </div>
                    ) : (
                      <div
                        style={{ maxHeight: "400px", overflowY: "auto" }}
                        className="border rounded"
                      >
                        <Table hover>
                          <thead className="bg-light">
                            <tr>
                              <th>Sản phẩm</th>
                              <th>Số lượng</th>
                              <th style={{ width: "80px" }}>Thao tác</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedProducts.map((product, index) => (
                              <tr key={index}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <img
                                      src={
                                        product?.productImage
                                          ? `http://localhost:9999${product?.productImage}`
                                          : "http://localhost:9999/uploads/default-product.png"
                                      }
                                      width="40"
                                      height="40"
                                      className="rounded me-2 object-fit-cover"
                                      alt={product?.productName}
                                    />
                                    <span>{product?.productName}</span>
                                  </div>
                                </td>
                                <td>
                                  <Form.Control
                                    type="number"
                                    min="1"
                                    className="form-control-sm"
                                    value={product.quantity}
                                    onChange={(e) =>
                                      handleQuantityChange(
                                        index,
                                        e.target.value
                                      )
                                    }
                                    style={{ maxWidth: "100px" }}
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
                                <td className="text-center">
                                  <Button
                                    variant="link"
                                    className="p-0 me-2 text-info"
                                    onClick={() => {
                                      setModalProduct(product);
                                      setShowModal(true);
                                    }}
                                  >
                                    <BsEye size={18} />
                                  </Button>
                                  <Button
                                    variant="link"
                                    className="p-0 text-danger"
                                    onClick={() => handleRemoveProduct(index)}
                                  >
                                    <BsTrash size={18} />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    )}
                  </Col>
                </Row>
              )}

              <Row className="mt-4">
                <Col md={6}>
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
                </Col>
              </Row>

              <div className="d-flex justify-content-between mt-3">
                <Button
                  variant="outline-secondary"
                  onClick={() => navigate(-1)}
                >
                  Quay lại
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={selectedProducts?.length === 0}
                >
                  Tạo phiếu xuất
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết sản phẩm</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalProduct && (
            <div className="d-flex">
              <div className="product-image text-center me-3">
                <img
                  src={
                    modalProduct.productImage
                      ? `http://localhost:9999${modalProduct.productImage}`
                      : "http://localhost:9999/uploads/default-product.png"
                  }
                  alt="Hình sản phẩm"
                  className="img-fluid rounded"
                  style={{ maxWidth: "150px", maxHeight: "150px" }}
                />
              </div>
              <div className="product-info">
                <h5>{modalProduct.productName || "Không có"}</h5>
                <p>
                  <strong>Danh mục:</strong>{" "}
                  {getCategoryName(modalProduct.categoryId)}
                </p>
                <p>
                  <strong>Tồn kho:</strong> {modalProduct.stock || 0} sản phẩm
                </p>
                <p>
                  <strong>Vị trí:</strong> {modalProduct.location || "Không có"}
                </p>
                {modalProduct.description && (
                  <p>
                    <strong>Mô tả:</strong> {modalProduct.description}
                  </p>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ExportProduct;
