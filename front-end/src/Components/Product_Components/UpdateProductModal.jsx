import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import axios from "axios";

const UpdateProductModal = ({
  open,
  handleClose,
  product,
  onUpdateSuccess,
}) => {
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
  const [shelves, setShelves] = useState([]);
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch categories and shelves
  useEffect(() => {
    Promise.all([
      axios.get("http://localhost:9999/categories/getAllCategories"),
      axios.get("http://localhost:9999/inventory")
    ])
      .then(([categoriesResponse, shelvesResponse]) => {
        setCategories(categoriesResponse.data);
        setShelves(shelvesResponse.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setGeneralError("Error loading categories or shelves");
      });
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

  const handleShelfSelect = (e) => {
    const selectedShelfId = e.target.value;
    if (!selectedShelfId) return;

    const selectedShelf = shelves.find(shelf => shelf._id === selectedShelfId);
    if (selectedShelf) {
      setProductData(prevData => ({
        ...prevData,
        location: selectedShelf.name
      }));

      // Clear any location error
      setErrors(prevErrors => ({
        ...prevErrors,
        location: ""
      }));
    }
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
      onUpdateSuccess(); // Gọi callback để refresh danh sách sản phẩm
      handleClose();
    } catch (error) {
      console.error("Error updating product:", error);
      setGeneralError("Có lỗi xảy ra khi cập nhật sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={open} onHide={handleClose}>
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

          <Form.Group controlId="shelfSelect">
            <Form.Label>Chọn Kệ Hàng</Form.Label>
            <Form.Control
              as="select"
              onChange={handleShelfSelect}
              defaultValue=""
            >
              <option value="">Chọn kệ hàng có sẵn</option>
              {shelves.map((shelf) => (
                <option key={shelf._id} value={shelf._id}>
                  {shelf.name}
                </option>
              ))}
            </Form.Control>
            <Form.Text className="text-muted">
              Chọn kệ hàng hoặc nhập vị trí thủ công bên dưới
            </Form.Text>
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

            {productData.productImage && typeof productData.productImage === "string" && (
              <div className="mt-2">
                <p>Ảnh hiện tại:</p>
                <img
                  src={`http://localhost:9999${productData.productImage}`}
                  alt="Product preview"
                  style={{ maxWidth: "100%", height: "auto", maxHeight: "150px" }}
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
              required
            >
              <option value="active">Đang bán</option>
              <option value="inactive">Ngừng bán</option>
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Đóng
        </Button>
        <Button
          variant="primary"
          onClick={onUpdate}
          disabled={loading}
        >
          {loading ? "Đang cập nhật..." : "Lưu thay đổi"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UpdateProductModal;
