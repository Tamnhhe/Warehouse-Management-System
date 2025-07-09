//add
import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import axios from "axios";

const AddProduct = ({ show, handleClose, handleSave }) => {
  const [productData, setProductData] = useState({
    productName: "",
    categoryId: "",
    totalStock: 0, // Mặc định là 0, không cho phép nhập
    thresholdStock: 0,
    productImage: "", // Ban đầu là chuỗi rỗng, sẽ thay bằng file khi chọn
    unit: "",
    location: "",
    status: "active",
  });

  const [categories, setCategories] = useState([]);
  const [error, setError] = useState({
    productName: "",
    categoryId: "",
    productImage: "",
    unit: "",
    location: "",
    general: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:9999/categories/getAllCategories")
      .then((response) => setCategories(response.data))
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setError((prevError) => ({
      ...prevError,
      [name]: "",
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductData((prevData) => ({
        ...prevData,
        productImage: file, // Lưu file vào productData
      }));
      validateProductImage(file); // Validate ngay khi chọn file
    } else {
      setProductData((prevData) => ({
        ...prevData,
        productImage: "", // Reset nếu không chọn file
      }));
      validateProductImage(""); // Validate khi không có file
    }
  };

  const validateProductName = () => {
    if (!productData.productName) {
      setError((prevError) => ({
        ...prevError,
        productName: "Tên sản phẩm không được bỏ trống.",
      }));
      return false;
    }
    return true;
  };

  const validateCategory = () => {
    if (!productData.categoryId) {
      setError((prevError) => ({
        ...prevError,
        categoryId: "Danh mục không được bỏ trống.",
      }));
      return false;
    }
    return true;
  };

  const validateProductImage = (value = productData.productImage) => {
    if (!value) {
      setError((prevError) => ({
        ...prevError,
        productImage: "Hình ảnh sản phẩm không được bỏ trống.",
      }));
      return false;
    }
    if (value && typeof value !== "string" && !["image/jpeg", "image/png"].includes(value.type)) {
      setError((prevError) => ({
        ...prevError,
        productImage: "Hình ảnh phải là định dạng JPEG hoặc PNG.",
      }));
      return false;
    }
    setError((prevError) => ({
      ...prevError,
      productImage: "",
    }));
    return true;
  };

  const validateUnit = () => {
    if (!productData.unit) {
      setError((prevError) => ({
        ...prevError,
        unit: "Đơn vị không được bỏ trống.",
      }));
      return false;
    }
    return true;
  };

  const validateLocation = () => {
    if (!productData.location) {
      setError((prevError) => ({
        ...prevError,
        location: "Vị trí không được bỏ trống.",
      }));
      return false;
    }
    return true;
  };

  const checkProductNameExistence = async () => {
    try {
      const response = await axios.get(
        `http://localhost:9999/products/checkProductName?name=${productData.productName}`
      );
      return response.data.exists;
    } catch (error) {
      console.error("Error checking product name:", error);
      setError((prevError) => ({
        ...prevError,
        general: "Có lỗi xảy ra khi kiểm tra tên sản phẩm.",
      }));
      return false;
    }
  };

 const onSave = async () => {
  const isProductNameValid = validateProductName();
  const isCategoryValid = validateCategory();
  const isProductImageValid = validateProductImage();
  const isUnitValid = validateUnit();
  const isLocationValid = validateLocation();

  const productNameExists = await checkProductNameExistence();
  if (productNameExists) {
    setError((prevError) => ({
      ...prevError,
      productName: "Sản phẩm đã tồn tại trong kho.",
    }));
    return;
  }

  if (
    isProductNameValid &&
    isCategoryValid &&
    isProductImageValid &&
    isUnitValid &&
    isLocationValid
  ) {
    setLoading(true);
    setError((prevError) => ({ ...prevError, general: "" }));

    const formData = new FormData();
    formData.append("productName", productData.productName);
    formData.append("categoryId", productData.categoryId);
    formData.append("totalStock", productData.totalStock); // Mặc định là 0
    formData.append("productImage", productData.productImage); // Gửi file ảnh
    formData.append("unit", productData.unit);
    formData.append("location", productData.location);
    formData.append("status", productData.status);

    try {
      const response = await axios.post(
        "http://localhost:9999/products/createProduct",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      handleSave(); // Gọi lại hàm fetchAllProducts để cập nhật sản phẩm mới
      setProductData({
        productName: "",
        categoryId: "",
        totalStock: 0,
        productImage: "",
        unit: "",
        location: "",
        status: "active",
      });
      handleClose();
    } catch (error) {
      console.error("Error creating product:", error);
      setError((prevError) => ({
        ...prevError,
        general: error.response?.data?.message || "Có lỗi xảy ra khi thêm sản phẩm.",
      }));
    } finally {
      setLoading(false);
    }
  }
};


  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Thêm Sản Phẩm Mới</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error.general && <Alert variant="danger">{error.general}</Alert>}
        <Form>
          <Form.Group controlId="productName">
            <Form.Label>Tên Sản Phẩm</Form.Label>
            <Form.Control
              type="text"
              name="productName"
              value={productData.productName}
              onChange={handleChange}
              onBlur={validateProductName}
              isInvalid={!!error.productName}
            />
            <Form.Control.Feedback type="invalid">
              {error.productName}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="categoryId">
            <Form.Label>Danh Mục</Form.Label>
            <Form.Control
              as="select"
              name="categoryId"
              value={productData.categoryId}
              onChange={handleChange}
              onBlur={validateCategory}
              isInvalid={!!error.categoryId}
            >
              <option value="">Chọn danh mục</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.categoryName}
                </option>
              ))}
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              {error.categoryId}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Bỏ phần Ngưỡng Tồn Kho */}

          <Form.Group controlId="productImage">
            <Form.Label>Hình Ảnh Sản Phẩm</Form.Label>
            <Form.Control
              type="file"
              name="productImage"
              onChange={handleFileChange}
              isInvalid={!!error.productImage}
            />
            <Form.Control.Feedback type="invalid">
              {error.productImage}
            </Form.Control.Feedback>

            {productData.productImage && typeof productData.productImage !== "string" && (
              <div className="mt-3">
                <img
                  src={URL.createObjectURL(productData.productImage)}
                  alt="Product Preview"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </div>
            )}
          </Form.Group>

          <Form.Group controlId="unit">
            <Form.Label>Đơn Vị</Form.Label>
            <Form.Control
              type="text"
              name="unit"
              value={productData.unit}
              onChange={handleChange}
              onBlur={validateUnit}
              isInvalid={!!error.unit}
            />
            <Form.Control.Feedback type="invalid">
              {error.unit}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="location">
            <Form.Label>Vị Trí</Form.Label>
            <Form.Control
              type="text"
              name="location"
              value={productData.location}
              onChange={handleChange}
              onBlur={validateLocation}
              isInvalid={!!error.location}
            />
            <Form.Control.Feedback type="invalid">
              {error.location}
            </Form.Control.Feedback>
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
        <Button variant="primary" onClick={onSave} disabled={loading}>
          {loading ? "Đang lưu..." : "Lưu"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddProduct;
