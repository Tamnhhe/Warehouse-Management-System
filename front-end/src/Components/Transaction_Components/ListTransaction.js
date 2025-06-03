//Nguyễn Bảo Phi-HE173187-28/2/2025
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap"; // Import Bootstrap Modal

const ListTransaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filterTransactionType, setFilterTransactionType] = useState("all");
  const [editedTransactions, setEditedTransactions] = useState(new Set()); // Lưu danh sách giao dịch đã chỉnh sửa
  const [sortOrder, setSortOrder] = useState("asc"); // Trạng thái sắp xếp
  const [sortByDateOrder, setSortByDateOrder] = useState("desc"); // Trạng thái sắp xếp theo ngày giao dịch
  const [filterStatus, setFilterStatus] = useState([]); // Lưu danh sách trạng thái được chọn
  const navigate = useNavigate();

  // Lấy danh sách giao dịch từ API khi component được render
  useEffect(() => {
    axios
      .get("http://localhost:9999/inventoryTransactions/getAllTransactions")
      .then((response) => {
        setTransactions(response.data);
        setFilteredTransactions(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Lỗi gọi API:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let updatedTransactions = [...transactions];

    // Lọc theo loại giao dịch
    if (filterTransactionType !== "all") {
      updatedTransactions = updatedTransactions.filter(
        (t) => t.transactionType === filterTransactionType
      );
    }

    // Lọc theo trạng thái giao dịch
    if (filterStatus.length > 0) {
      updatedTransactions = updatedTransactions.filter((t) =>
        filterStatus.includes(t.status)
      );
    }
    setFilteredTransactions(updatedTransactions);
  }, [filterTransactionType, filterStatus, transactions]);

  // Xử lý lọc trạng thái bằng checkbox
  const handleStatusFilterChange = (event) => {
    const { value, checked } = event.target;
    setFilterStatus((prev) => {
      const newFilterStatus = checked
        ? [...prev, value] // Thêm trạng thái nếu được chọn
        : prev.filter((status) => status !== value); // Bỏ trạng thái nếu bỏ chọn

      return newFilterStatus;
    });
  };

  // Mở Modal cập nhật trạng thái giao dịch
  const openStatusModal = (transaction) => {
    if (
      transaction.status !== "pending" ||
      editedTransactions.has(transaction._id)
    )
      return;
    setSelectedTransaction(transaction);
    setNewStatus(transaction.status);
    setShowModal(true);
  };

  // Cập nhật trạng thái giao dịch
  const handleStatusChange = () => {
    if (!selectedTransaction) return;

    axios
      .put(
        `http://localhost:9999/inventoryTransactions/updateTransactionStatus/${selectedTransaction._id}`,
        { status: newStatus }
      )
      .then((res) => {
        setTransactions((prev) =>
          prev.map((t) =>
            t._id === selectedTransaction._id
              ? { ...t, status: res.data.status }
              : t
          )
        );
        setEditedTransactions((prev) =>
          new Set(prev).add(selectedTransaction._id)
        ); // Đánh dấu đã chỉnh sửa
        setShowModal(false);
      })
      .catch((error) => {
        console.error("Lỗi khi cập nhật trạng thái:", error);
      });
  };

  // Xử lý lọc loại giao dịch
  const handleFilterChange = (event) => {
    const value = event.target.value;
    setFilterTransactionType(value);

    if (value === "all") {
      setFilteredTransactions(transactions);
    } else {
      setFilteredTransactions(
        transactions.filter((t) => t.transactionType === value)
      );
    }
  };

  // Hàm sắp xếp danh sách theo tên nhà cung cấp
  const handleSortBySupplier = () => {
    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
      const supplierA = a.supplier?.name ?? ""; // Nếu `a.supplier` null, dùng chuỗi rỗng
      const supplierB = b.supplier?.name ?? ""; // Nếu `b.supplier` null, dùng chuỗi rỗng

      return sortOrder === "asc"
        ? supplierA.localeCompare(supplierB, "vi")
        : supplierB.localeCompare(supplierA, "vi");
    });

    setTransactions(sortedTransactions);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Sắp xếp theo ngày giao dịch (mới nhất -> cũ nhất hoặc ngược lại)
  const handleSortByDate = () => {
    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
      return sortByDateOrder === "asc"
        ? new Date(a.transactionDate) - new Date(b.transactionDate) // Cũ nhất trước
        : new Date(b.transactionDate) - new Date(a.transactionDate); // Mới nhất trước
    });

    setTransactions(sortedTransactions);
    setSortByDateOrder(sortByDateOrder === "asc" ? "desc" : "asc");
  };

  // Hiển thị spinner khi đang tải dữ liệu
  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="text-center text-primary mb-4">Danh sách giao dịch</h2>

      {/* Select box để lọc loại giao dịch */}
      <div className="d-flex mb-3">
        <Form.Select
          value={filterTransactionType}
          onChange={handleFilterChange}
          className="w-auto"
        >
          <option value="all">Tất cả</option>
          <option value="import">Nhập hàng</option>
          <option value="export">Xuất hàng</option>
        </Form.Select>

        {/* Checkbox lọc trạng thái */}
        <div className="d-flex align-items-center">
          <Form.Check
            inline
            label="Chờ xử lý"
            value="pending"
            checked={filterStatus.includes("pending")}
            onChange={handleStatusFilterChange}
          />
          <Form.Check
            inline
            label="Hoàn thành"
            value="completed"
            checked={filterStatus.includes("completed")}
            onChange={handleStatusFilterChange}
          />
          <Form.Check
            inline
            label="Từ chối"
            value="cancelled"
            checked={filterStatus.includes("cancelled")}
            onChange={handleStatusFilterChange}
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th style={{ cursor: "pointer" }} onClick={handleSortBySupplier}>
                Nhà cung cấp {sortOrder === "asc" ? "↑" : "↓"}
              </th>
              <th>Loại giao dịch</th>
              <th style={{ cursor: "pointer" }} onClick={handleSortByDate}>
                Ngày giao dịch {sortByDateOrder === "asc" ? "↑" : "↓"}
              </th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction, index) => (
              <tr key={transaction._id}>
                <td>{index + 1}</td>
                <td>
                  {transaction.transactionType === "import"
                    ? transaction.supplier?.name || "Không có dữ liệu"
                    : "-"}
                </td>
                <td>
                  <span
                    className={`badge ${
                      transaction.transactionType === "import"
                        ? "bg-success"
                        : "bg-danger"
                    }`}
                  >
                    {transaction.transactionType === "import"
                      ? "Nhập hàng"
                      : "Xuất hàng"}
                  </span>
                </td>
                <td>
                  {new Date(transaction.transactionDate).toLocaleDateString()}
                </td>
                <td className="text-end">
                  {transaction.totalPrice.toLocaleString()} VNĐ
                </td>
                <td>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => openStatusModal(transaction)}
                    disabled={
                      transaction.status !== "pending" ||
                      editedTransactions.has(transaction._id)
                    } // Chặn chỉnh sửa nếu đã cập nhật
                  >
                    {transaction.status === "pending" && "🟡 Chờ xử lý"}
                    {transaction.status === "completed" && "✅ Hoàn thành"}
                    {transaction.status === "cancelled" && "❌ Từ chối"}
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-info btn-sm me-2"
                    onClick={() =>
                      transaction.transactionType === "import"
                        ? navigate(`/transaction/${transaction._id}`)
                        : navigate(`/export-detail/${transaction._id}`)
                    }
                  >
                    Xem
                  </button>
                  {transaction.transactionType === "import" ? (
                    transaction.status === "pending" ? (
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() =>
                          navigate(`/edit-transaction/${transaction._id}`)
                        }
                      >
                        Rà soát số lượng
                      </button>
                    ) : (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() =>
                          alert(
                            "Bạn không thể chỉnh sửa giao dịch đã hoàn tất hoặc bị từ chối."
                          )
                        }
                      >
                        Rà soát số lượng
                      </button>
                    )
                  ) : (
                    <span className="text-muted"></span> // hoặc bỏ trống
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal chọn trạng thái */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Chọn trạng thái mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTransaction && (
            <div>
              <p>
                Giao dịch: <strong>{selectedTransaction._id}</strong>
              </p>
              <div className="form-check">
                <input
                  type="radio"
                  className="form-check-input"
                  name="status"
                  value="pending"
                  checked={newStatus === "pending"}
                  onChange={(e) => setNewStatus(e.target.value)}
                />
                <label className="form-check-label">🟡 Chờ xử lý</label>
              </div>
              <div className="form-check">
                <input
                  type="radio"
                  className="form-check-input"
                  name="status"
                  value="completed"
                  checked={newStatus === "completed"}
                  onChange={(e) => setNewStatus(e.target.value)}
                />
                <label className="form-check-label">✅ Hoàn thành</label>
              </div>
              <div className="form-check">
                <input
                  type="radio"
                  className="form-check-input"
                  name="status"
                  value="cancelled"
                  checked={newStatus === "cancelled"}
                  onChange={(e) => setNewStatus(e.target.value)}
                />
                <label className="form-check-label">❌ Từ chối</label>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleStatusChange}>
            Xác nhận
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ListTransaction;
