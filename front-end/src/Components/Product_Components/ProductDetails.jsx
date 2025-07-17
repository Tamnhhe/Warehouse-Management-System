//product details
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Badge } from "react-bootstrap";
import "./ProductDetails.css"; // Import file CSS riêng cho Modal
import LocationOnIcon from "@mui/icons-material/LocationOn";

const ProductDetails = ({ show, handleClose, product }) => {
  const [categoryName, setCategoryName] = useState(""); // State to store category name
  const [categories, setCategories] = useState([]); // State to store all categories
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [supplierName, setSupplierName] = useState(""); // State to store supplier name
  const [shelfInfo, setShelfInfo] = useState(null); // State to store shelf information

  useEffect(() => {
    const fetchCate = async () => {
      try {
        const response = await axios.get(
          "http://localhost:9999/categories/getAllCategories"
        );
        setCategories(response.data);
      } catch (error) {
        setError("Unable to load category list.");
      } finally {
        setLoading(false);
      }
    };
    fetchCate();
  }, []);

  useEffect(() => {
    const findCategoryName = () => {
      if (product && product.categoryId) {
        // Tìm tên danh mục từ danh sách các categories
        const category = categories.find(cat => String(cat._id) === String(product.categoryId));
        if (category) {
          setCategoryName(category.categoryName); // Cập nhật tên danh mục
        }
      }
    };

    const fetchSupplier = async () => {
      if (product && product.supplierId) {
        try {
          const response = await axios.get(
            `http://localhost:9999/suppliers/${product.supplierId}`
          );
          setSupplierName(response.data.supplierName); // Cập nhật tên nhà cung cấp
        } catch (error) {
          setError("Unable to load supplier information.");
        }
      }
    };

    const fetchShelfInfo = async () => {
      if (product && product.location) {
        try {
          // Try to find the shelf by name
          const response = await axios.get(
            `http://localhost:9999/inventory`
          );
          const shelf = response.data.find(s => s.name === product.location);
          if (shelf) {
            setShelfInfo(shelf);
          } else {
            setShelfInfo(null);
          }
        } catch (error) {
          console.error("Error fetching shelf information:", error);
          setShelfInfo(null);
        }
      } else {
        setShelfInfo(null);
      }
    };

    if (show) {
      findCategoryName(); // Tìm và cập nhật tên danh mục khi modal mở và có sản phẩm
      fetchSupplier(); // Lấy thông tin nhà cung cấp khi modal mở
      fetchShelfInfo(); // Lấy thông tin kệ hàng khi modal mở
    }
  }, [show, product, categories]);

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton className="product-details-header">
        <Modal.Title>{product?.productName || "Thông Tin Sản Phẩm"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <>
            {error && <p className="text-danger">{error}</p>}
            {product && (
              <div className="product-details">
                <div className="product-image-container">
                  <img
                    src={
                      product.productImage
                        ? `http://localhost:9999${product.productImage}`
                        : "http://localhost:9999/uploads/default-product.png"
                    }
                    alt="Product Image"
                    className="product-image-detail"
                  />
                </div>

                <div className="product-info">
                  <h5 className="mb-3">Thông tin cơ bản</h5>

                  <div className="info-row">
                    <span className="info-label">Danh mục:</span>
                    <Badge bg="info" className="info-value-badge">
                      {product?.categoryId?.categoryName || categoryName || "Không có thông tin"}
                    </Badge>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Tồn kho:</span>
                    <span className="info-value">
                      <strong>{product.totalStock}</strong> {product.unit}
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Ngưỡng tồn kho:</span>
                    <span className="info-value">{product.thresholdStock} {product.unit}</span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Trạng thái:</span>
                    <Badge
                      bg={product.status === 'active' ? 'success' : 'danger'}
                      className="info-value-badge"
                    >
                      {product.status === 'active' ? 'Đang bán' : 'Ngừng bán'}
                    </Badge>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Nhà cung cấp:</span>
                    <span className="info-value">
                      {supplierName || "Không có thông tin"}
                    </span>
                  </div>

                  <h5 className="mt-4 mb-3 d-flex align-items-center">
                    <LocationOnIcon color="primary" className="me-1" />
                    Vị trí lưu trữ
                  </h5>

                  <div className="shelf-info">
                    <div className="info-row">
                      <span className="info-label">Kệ hàng:</span>
                      <Badge
                        bg="primary"
                        className="info-value-badge"
                      >
                        {product.location}
                      </Badge>
                    </div>

                    {shelfInfo && (
                      <>
                        <div className="info-row">
                          <span className="info-label">Loại kệ:</span>
                          <span className="info-value">
                            {shelfInfo.category?.categoryName || "Không phân loại"}
                          </span>
                        </div>

                        <div className="info-row">
                          <span className="info-label">Sức chứa:</span>
                          <div className="progress shelf-progress">
                            <div
                              className={`progress-bar ${shelfInfo.currentQuantitative / shelfInfo.maxQuantitative > 0.8 ? 'bg-danger' : 'bg-success'}`}
                              role="progressbar"
                              style={{ width: `${(shelfInfo.currentQuantitative / shelfInfo.maxQuantitative) * 100}%` }}
                              aria-valuenow={shelfInfo.currentQuantitative}
                              aria-valuemin="0"
                              aria-valuemax={shelfInfo.maxQuantitative}
                            >
                              {Math.round((shelfInfo.currentQuantitative / shelfInfo.maxQuantitative) * 100)}%
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProductDetails;