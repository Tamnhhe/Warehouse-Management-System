//aaaa
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import "./ProductDetails.css"; // Import file CSS riêng cho Modal

const ProductDetails = ({ show, handleClose, product }) => {
  const [categoryName, setCategoryName] = useState(""); // State to store category name
  const [categories, setCategories] = useState([]); // State to store all categories
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [supplierName, setSupplierName] = useState(""); // State to store supplier name

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

    if (show) {
      findCategoryName(); // Tìm và cập nhật tên danh mục khi modal mở và có sản phẩm
      fetchSupplier(); // Lấy thông tin nhà cung cấp khi modal mở
    }
  }, [show, product, categories]);

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Thông Tin Sản Phẩm</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <>
            {error && <p>{error}</p>}
            {product && (
              <div className="product-details">
                <div className="product-info">
                  <p>
                    <strong>Tên sản phẩm:</strong> {product.productName}
                  </p>
                  <p>
                    <strong>Danh mục:</strong>{" "}
                    {product?.categoryId?.categoryName || "Không có thông tin"}
                  </p>
                  <p>
                    <strong>Tổng số lượng:</strong> {product.totalStock}
                  </p>
                  <p>
                    <strong>Ngưỡng tồn kho:</strong> {product.thresholdStock}
                  </p>
                  <p>
                    <strong>Đơn vị:</strong> {product.unit}
                  </p>
                  <p>
                    <strong>Vị trí:</strong> {product.location}
                  </p>
                  <p>
                    <strong>Trạng thái:</strong> {product.status}
                  </p>
                  <p>
                    <strong>Nhà cung cấp:</strong>{" "}
                    {supplierName || "Không có thông tin"}
                  </p>
                </div>
                <div className="product-image">
                  <img
                    src={
                      product.productImage
                        ? `http://localhost:9999${product.productImage}`
                        : "http://localhost:9999/uploads/default-product.png"
                    }
                    alt="Product Image"
                    width="150"
                  />
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
