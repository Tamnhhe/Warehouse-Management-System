//update
import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import axios from "axios";

const UpdateProductModal = ({ show, handleClose, product, handleUpdate }) => {
  const [productData, setProductData] = useState({
    productName: "",
    categoryId: "",
    productImage: "",
    unit: "",
    location: "",
    status: "active",
  });

  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch categories
  useEffect(() => {
    axios
      .get("http://localhost:9999/categories/getAllCategories")
      .then((response) => setCategories(response.data))
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  // Update productData after both product and categories are loaded
  useEffect(() => {
    if (product && categories.length > 0) {
      const categoryId =
        typeof product.categoryId === "object"
          ? product.categoryId._id
          : product.categoryId;

      setProductData({
        productName: product.productName || "",
        categoryId: categoryId || "",
        productImage: product.productImage || "",
        unit: product.unit || "",
        location: product.location || "",
        status: product.status || "active",
      });
    }
  }, [product, categories]);

  // Validate fields
  const validateField = (name, value) => {
    switch (name) {
      case "productName":
        if (!value.trim()) return "Tên sản phẩm không được để trống.";
        if (value.length < 3) return "Tên sản phẩm phải dài ít nhất 3 ký tự.";
        return "";
      case "categoryId":
        if (!value) return "Vui lòng chọn một danh mục.";
        return "";
      case "unit":
        if (!value.trim()) return "Đơn vị không được để trống.";
        return "";
      case "location":
        if (!value.trim()) return "Vị trí không được để trống.";
        return "";
      case "productImage":
        if (
          value &&
          typeof value !== "string" &&
          !["image/jpeg", "image/png"].includes(value.type)
        ) {
          return "Hình ảnh phải là định dạng JPEG hoặc PNG.";
        }
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    const error = validateField(name, value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductData((prevData) => ({
        ...prevData,
        productImage: file,
      }));

      const error = validateField("productImage", file);
      setErrors((prevErrors) => ({
        ...prevErrors,
        productImage: error,
      }));
    }
  };

  const onUpdate = async () => {
    const newErrors = {};
    Object.keys(productData).forEach((key) => {
      if (key !== "status") {
        newErrors[key] = validateField(key, productData[key]);
      }
    });

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error !== "")) {
      setGeneralError("Vui lòng sửa các lỗi trước khi cập nhật.");
      return;
    }

    setLoading(true);
    setGeneralError("");

    const formData = new FormData();
    Object.keys(productData).forEach((key) => {
      if (key !== "productImage") {
        formData.append(key, productData[key]);
      }
    });

    if (
      productData.productImage &&
      typeof productData.productImage !== "string"
    ) {
      formData.append("productImage", productData.productImage);
    }

    try {
      const response = await axios.put(
        `http://localhost:9999/products/updateProduct/${product._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      handleUpdate(response.data);
      handleClose();
    } catch (error) {
      console.error("Error updating product:", error);
      setGeneralError("Có lỗi xảy ra khi cập nhật sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Cập Nhật Sản Phẩm</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {generalError && <Alert variant="danger">{generalError}</Alert>}
        <Form>
          <Form.Group controlId="productName">
            <Form.Label>Tên Sản Phẩm</Form.Label>
            <Form.Control
              type="text"
              name="productName"
              value={productData.productName}
              onChange={handleChange}
              isInvalid={!!errors.productName}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.productName}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="categoryId">
            <Form.Label>Danh Mục</Form.Label>
            <Form.Control
              as="select"
              name="categoryId"
              value={productData.categoryId}
              onChange={handleChange}
              isInvalid={!!errors.categoryId}
              required
            >
              <option value="">Chọn danh mục</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.categoryName}
                </option>
              ))}
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              {errors.categoryId}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="unit">
            <Form.Label>Đơn Vị</Form.Label>
            <Form.Control
              type="text"
              name="unit"
              value={productData.unit}
              onChange={handleChange}
              isInvalid={!!errors.unit}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.unit}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="location">
            <Form.Label>Vị Trí</Form.Label>
            <Form.Control
              type="text"
              name="location"
              value={productData.location}
              onChange={handleChange}
              isInvalid={!!errors.location}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.location}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="productImage">
            <Form.Label>Hình Ảnh Sản Phẩm</Form.Label>
            <Form.Control
              type="file"
              name="productImage"
              onChange={handleFileChange}
              isInvalid={!!errors.productImage}
            />
            <Form.Control.Feedback type="invalid">
              {errors.productImage}
            </Form.Control.Feedback>

            {/* Hiển thị ảnh cũ nếu có */}
            {productData.productImage &&
              typeof productData.productImage === "string" && (
                <div className="mt-3">
                  <img
                    src={`http://localhost:9999${productData.productImage}`}
                    alt="Product"
                    width="60"
                  />
                </div>
              )}

            {/* Hiển thị ảnh mới nếu chọn */}
            {productData.productImage &&
              typeof productData.productImage !== "string" && (
                <div className="mt-3">
                  <img
                    src={URL.createObjectURL(productData.productImage)}
                    alt="Preview"
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                </div>
              )}
          </Form.Group>

          <Form.Group controlId="status">
            <Form.Label>Trạng Thái</Form.Label>
            <Form.Control
              as="select"
              name="status"
              value={productData.status}
              onChange={handleChange}
            >
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Đóng
        </Button>
        <Button variant="primary" onClick={onUpdate} disabled={loading}>
          {loading ? "Đang cập nhật..." : "Cập nhật"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UpdateProductModal;
