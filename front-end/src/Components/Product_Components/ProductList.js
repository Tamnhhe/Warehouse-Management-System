import React, { useEffect, useState, useMemo } from "react";
import { Table, Button, Alert } from "react-bootstrap";
import axios from "axios";
import useProduct from "./useProduct";
import FilterProduct from "./FilterProduct";
import UpdateProductModal from "./UpdateProductModal";
import ProductDetails from "./ProductDetails";
import AddProduct from "./AddProduct";
import style from "./style.css";

const ProductList = () => {
  const { loading, error } = useProduct();
  const [deleteError, setDeleteError] = useState("");
  const [filterText, setFilterText] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showProductDetailsModal, setShowProductDetailsModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);

useEffect(() => {
  const fetchProducts = async () => {
    try {
      // ĐÚNG route lấy tất cả sản phẩm
      const res = await axios.get(
        "http://localhost:9999/supplierProducts/getAllSupplierProducts"
      );
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };
  fetchProducts();
}, []);

  const handleSort = (column) => {
    setSortBy(column);
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  const filteredProducts = useMemo(() => {
    let updatedProducts = [...products];

    if (filterText) {
     updatedProducts = updatedProducts.filter((item) =>
  item.product?.productName?.toLowerCase().includes(filterText.toLowerCase())
);
    }

    if (statusFilter !== null) {
      updatedProducts = updatedProducts.filter((item) =>
        statusFilter
          ? item.status === "active"
          : item.status === "inactive"
      );
    }

    updatedProducts.sort((a, b) => {
     if (sortBy === "name") {
  return sortDirection === "asc"
    ? (a.product?.productName || "").localeCompare(b.product?.productName || "")
    : (b.product?.productName || "").localeCompare(a.product?.productName || "");

      } else if (sortBy === "stock") {
        return sortDirection === "asc"
          ? (a.totalStock || 0) - (b.totalStock || 0)
          : (b.totalStock || 0) - (a.totalStock || 0);
      } else if (sortBy === "unit") {
        return sortDirection === "asc"
          ? (a.unit || "").localeCompare(b.unit || "")
          : (b.unit || "").localeCompare(a.unit || "");
      } else if (sortBy === "location") {
        return sortDirection === "asc"
          ? (a.location || "").localeCompare(b.location || "")
          : (b.location || "").localeCompare(a.location || "");
      }
      return 0;
    });

    return updatedProducts;
  }, [products, filterText, sortBy, sortDirection, statusFilter]);

  const handleOpenUpdateModal = (item) => {
    setSelectedProduct(item);
    setShowUpdateModal(true);
  };

  const handleOpenProductDetailsModal = (item) => {
    setSelectedProduct(item);
    setShowProductDetailsModal(true);
  };

  const handleChangeStatus = async (productId, newStatus) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn thay đổi trạng thái của sản phẩm không?"
      )
    )
      return;
    try {
      await axios.put(
        `http://localhost:9999/products/inactivateProduct/${productId}`,
        { status: newStatus }
      );
      setProducts((prevProducts) =>
        prevProducts.map((item) =>
          item.productId === productId
            ? { ...item, status: newStatus }
            : item
        )
      );
    } catch (err) {
      setDeleteError("Có lỗi xảy ra khi thay đổi trạng thái sản phẩm.");
      console.error("Change Status Error:", err);
    }
  };

  const handleFilter = ({ filterText }) => {
    setFilterText(filterText);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p>Có lỗi xảy ra: {error.message}</p>;

  return (
    <div className="product-list-container">
      <div>
        <Button
          variant="success"
          onClick={() => setShowAddProductModal(true)}
          style={{ marginBottom: "20px" }}
        >
          Thêm Sản Phẩm
        </Button>
      </div>
      {deleteError && <Alert variant="danger">{deleteError}</Alert>}
      <FilterProduct onFilter={handleFilter} />

      <div className="filter-buttons">
        <Button
          variant={statusFilter === true ? "primary" : "light"}
          onClick={() => handleStatusFilter(true)}
          className={statusFilter === true ? "active" : ""}
        >
          Đang Bán
        </Button>
        <Button
          variant={statusFilter === false ? "primary" : "light"}
          onClick={() => handleStatusFilter(false)}
          className={statusFilter === false ? "active" : ""}
        >
          Ngừng Bán
        </Button>
        <Button
          variant={statusFilter === null ? "primary" : "light"}
          onClick={() => setStatusFilter(null)}
          className={statusFilter === null ? "active" : ""}
        >
          Tất Cả
        </Button>
      </div>

      <div className="scrollable-table">
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th style={{ textAlign: "left", verticalAlign: "middle" }}>
                Hình Ảnh
              </th>
              <th
                style={{
                  cursor: "pointer",
                  textAlign: "left",
                  verticalAlign: "middle",
                }}
                onClick={() => handleSort("name")}
              >
                Tên Sản Phẩm{" "}
                {sortBy === "name" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                style={{
                  width: "100px",
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                Tổng SL
              </th>
              <th
                style={{
                  width: "120px",
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                Giá TB
              </th>
              <th
                style={{
                  width: "120px",
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                Giá mới
              </th>
              <th
                style={{
                  cursor: "pointer",
                  textAlign: "left",
                  verticalAlign: "middle",
                }}
                onClick={() => handleSort("unit")}
              >
                Đơn Vị{" "}
                {sortBy === "unit" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                style={{
                  cursor: "pointer",
                  textAlign: "left",
                  verticalAlign: "middle",
                }}
                onClick={() => handleSort("location")}
              >
                Vị Trí{" "}
                {sortBy === "location" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th style={{ textAlign: "left", verticalAlign: "middle" }}>
                Trạng Thái
              </th>
              <th style={{ textAlign: "left", verticalAlign: "middle" }}>
                Hành Động
              </th>
            </tr>
          </thead>

          <tbody>
  {filteredProducts.map((item) => (
    <tr
      key={item.product?._id}
      onClick={(e) => {
        if (e.target.closest(".action-buttons") === null) {
          handleOpenProductDetailsModal(item);
        }
      }}
    >
      <td>
        <img
          src={
            item.product?.productImage
              ? `http://localhost:9999${item.product.productImage}`
              : "http://localhost:9999/uploads/default-product.png"
          }
          alt="Product Image"
          width="50"
        />
      </td>
      <td>
        <Button
          variant="link"
          style={{ textDecoration: "none", color: "inherit" }}
          onClick={() => handleOpenProductDetailsModal(item)}
        >
          {item.product?.productName}
        </Button>
      </td>
      <td style={{ textAlign: "center" }}>{item.stock}</td>
      <td style={{ textAlign: "right" }}>
        {(item.price || 0).toLocaleString("vi-VN")} đ
      </td>
      <td style={{ textAlign: "right" }}>
        {(item.product?.newPrice || 0).toLocaleString("vi-VN")} đ
      </td>
      <td>{item.product?.unit}</td>
      <td>{item.product?.location}</td>
      <td>
        {item.product?.status === "active" ? "Đang bán" : "Ngừng bán"}
      </td>
      <td className="action-buttons">
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleOpenUpdateModal(item)}
          style={{ marginRight: "5px" }}
        >
          Chỉnh sửa
        </Button>
        <Button
          variant={item.product?.status === "active" ? "danger" : "success"}
          size="sm"
          onClick={() =>
            handleChangeStatus(
              item.product?._id,
              item.product?.status === "active" ? "inactive" : "active"
            )
          }
        >
          {item.product?.status === "active" ? "Vô hiệu hóa" : "Kích hoạt"}
        </Button>
      </td>
    </tr>
  ))}
</tbody>
        </Table>
      </div>

      {showUpdateModal && selectedProduct && (
        <UpdateProductModal
          show={showUpdateModal}
          product={selectedProduct}
          onHide={() => setShowUpdateModal(false)}
          onUpdate={(updatedProduct) => {
            setProducts((prev) =>
              prev.map((p) =>
                p.productId === updatedProduct.productId
                  ? { ...p, ...updatedProduct }
                  : p
              )
            );
          }}
        />
      )}

      {showProductDetailsModal && selectedProduct && (
        <ProductDetails
          show={showProductDetailsModal}
          product={selectedProduct}
          onHide={() => setShowProductDetailsModal(false)}
        />
      )}

      {showAddProductModal && (
        <AddProduct
          show={showAddProductModal}
          onHide={() => setShowAddProductModal(false)}
          onAdd={(newProduct) => setProducts((prev) => [...prev, newProduct])}
        />
      )}
    </div>
  );
};

export default ProductList;