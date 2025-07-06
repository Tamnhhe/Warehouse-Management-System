//Nguyễn Bảo Phi-HE173187-28/2/2025
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// <-- KHU VỰC THAY ĐỔI: Import thêm Row, Col, Card -->
import { Modal, Button, Form, Row, Col, Card, Spinner } from "react-bootstrap"; 

const ListTransaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filterTransactionType, setFilterTransactionType] = useState("all");
  const [editedTransactions, setEditedTransactions] = useState(new Set()); 
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortByDateOrder, setSortByDateOrder] = useState("desc");
  const [filterStatus, setFilterStatus] = useState([]); 
  const navigate = useNavigate();

  // Logic fetching và useEffects giữ nguyên, chúng đã rất tốt rồi.
  useEffect(() => {
    axios
      .get("http://localhost:9999/inventoryTransactions/getAllTransactions")
      .then((response) => {
        // Sắp xếp mặc định theo ngày mới nhất trước
        const sortedData = response.data.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));
        setTransactions(sortedData);
        setFilteredTransactions(sortedData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Lỗi gọi API:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let updatedTransactions = [...transactions];
    if (filterTransactionType !== "all") {
      updatedTransactions = updatedTransactions.filter(
        (t) => t.transactionType === filterTransactionType
      );
    }
    if (filterStatus.length > 0) {
      updatedTransactions = updatedTransactions.filter((t) =>
        filterStatus.includes(t.status)
      );
    }
    setFilteredTransactions(updatedTransactions);
  }, [filterTransactionType, filterStatus, transactions]);

  // Các hàm xử lý sự kiện (handlers) giữ nguyên
  const handleStatusFilterChange = (event) => {
    const { value, checked } = event.target;
    setFilterStatus((prev) => {
      const newFilterStatus = checked
        ? [...prev, value]
        : prev.filter((status) => status !== value);
      return newFilterStatus;
    });
  };

  const openStatusModal = (transaction) => {
    if (transaction.status !== "pending" || editedTransactions.has(transaction._id))
      return;
    setSelectedTransaction(transaction);
    setNewStatus(transaction.status);
    setShowModal(true);
  };

  const handleStatusChange = () => {
    if (!selectedTransaction) return;
    axios
      .put(
        `http://localhost:9999/inventoryTransactions/updateTransactionStatus/${selectedTransaction._id}`,
        { status: newStatus }
      )
      .then((res) => {
        const updatedList = transactions.map((t) =>
            t._id === selectedTransaction._id ? { ...t, status: res.data.status } : t
        );
        setTransactions(updatedList);
        setEditedTransactions((prev) => new Set(prev).add(selectedTransaction._id));
        setShowModal(false);
      })
      .catch((error) => console.error("Lỗi khi cập nhật trạng thái:", error));
  };
  
  const handleFilterChange = (event) => setFilterTransactionType(event.target.value);

  const handleSortBySupplier = () => {
    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
      const supplierA = a.supplier?.name ?? "";
      const supplierB = b.supplier?.name ?? "";
      return sortOrder === "asc"
        ? supplierA.localeCompare(supplierB, "vi")
        : supplierB.localeCompare(supplierA, "vi");
    });
    setFilteredTransactions(sortedTransactions);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleSortByDate = () => {
    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
      return sortByDateOrder === "asc"
        ? new Date(a.transactionDate) - new Date(b.transactionDate)
        : new Date(b.transactionDate) - new Date(a.transactionDate);
    });
    setFilteredTransactions(sortedTransactions);
    setSortByDateOrder(sortByDateOrder === "asc" ? "desc" : "asc");
  };

  // Spinner khi tải
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Đang tải dữ liệu...</span>
      </div>
    );
  }

  // <-- KHU VỰC THAY ĐỔI LỚN BẮT ĐẦU TỪ ĐÂY -->
  return (
    <div className="container mt-4">
      <h2 className="text-center text-primary mb-4">Danh sách giao dịch</h2>

      {/* Bộ lọc đã được làm responsive */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="gy-3">
            <Col md={4}>
              <Form.Group controlId="filterType">
                <Form.Label className="fw-bold">Loại giao dịch</Form.Label>
                <Form.Select value={filterTransactionType} onChange={handleFilterChange}>
                  <option value="all">Tất cả</option>
                  <option value="import">Nhập hàng</option>
                  <option value="export">Xuất hàng</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={8}>
               <Form.Group>
                <Form.Label className="fw-bold">Trạng thái</Form.Label>
                <div className="d-flex flex-wrap gap-3">
                  <Form.Check inline label="Chờ xử lý" value="pending" checked={filterStatus.includes("pending")} onChange={handleStatusFilterChange} />
                  <Form.Check inline label="Hoàn thành" value="completed" checked={filterStatus.includes("completed")} onChange={handleStatusFilterChange} />
                  <Form.Check inline label="Từ chối" value="cancelled" checked={filterStatus.includes("cancelled")} onChange={handleStatusFilterChange} />
                </div>
               </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* GIAO DIỆN BẢNG CHO DESKTOP (Ẩn trên mobile) */}
      <div className="d-none d-md-block table-responsive">
        <table className="table table-striped table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th style={{ cursor: "pointer" }} onClick={handleSortBySupplier}>Nhà cung cấp {sortOrder === "asc" ? "↑" : "↓"}</th>
              <th>Loại giao dịch</th>
              <th style={{ cursor: "pointer" }} onClick={handleSortByDate}>Ngày giao dịch {sortByDateOrder === "asc" ? "↑" : "↓"}</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th style={{ minWidth: "220px" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction, index) => (
              <tr key={transaction._id}>
                <td>{index + 1}</td>
                <td>{transaction.transactionType === "import" ? transaction.supplier?.name || "N/A" : "-"}</td>
                <td><span className={`badge ${transaction.transactionType === "import" ? "bg-success" : "bg-danger"}`}>{transaction.transactionType === "import" ? "Nhập" : "Xuất"}</span></td>
                <td>{new Date(transaction.transactionDate).toLocaleDateString()}</td>
                <td className="text-end">{transaction.totalPrice.toLocaleString()} VNĐ</td>
                <td>
                  <Button variant="outline-primary" size="sm" onClick={() => openStatusModal(transaction)} disabled={transaction.status !== "pending" || editedTransactions.has(transaction._id)}>
                    {transaction.status === "pending" && "🟡 Chờ xử lý"}
                    {transaction.status === "completed" && "✅ Hoàn thành"}
                    {transaction.status === "cancelled" && "❌ Từ chối"}
                  </Button>
                </td>
                <td>
                  <Button variant="info" size="sm" className="me-2" onClick={() => navigate(transaction.transactionType === "import" ? `/transaction/${transaction._id}` : `/export-detail/${transaction._id}`)}>Xem</Button>
                  {transaction.transactionType === "import" && (
                    <Button variant="warning" size="sm" onClick={() => navigate(`/edit-transaction/${transaction._id}`)} disabled={transaction.status !== 'pending'}>Rà soát</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* GIAO DIỆN CARD CHO MOBILE (Ẩn trên desktop) */}
      <div className="d-md-none">
        {filteredTransactions.map((transaction) => (
          <Card key={transaction._id} className="mb-3">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <strong>{transaction.transactionType === "import" ? transaction.supplier?.name || 'Giao dịch nhập' : 'Giao dịch xuất'}</strong>
              </div>
              <span className={`badge ${transaction.transactionType === "import" ? "bg-success" : "bg-danger"}`}>{transaction.transactionType === "import" ? "Nhập" : "Xuất"}</span>
            </Card.Header>
            <Card.Body>
              <p className="mb-2"><strong>Ngày:</strong> {new Date(transaction.transactionDate).toLocaleDateString()}</p>
              <p className="mb-2"><strong>Tổng tiền:</strong> <span className="text-danger fw-bold">{transaction.totalPrice.toLocaleString()} VNĐ</span></p>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <strong>Trạng thái:</strong>
                <Button variant="outline-primary" size="sm" onClick={() => openStatusModal(transaction)} disabled={transaction.status !== "pending" || editedTransactions.has(transaction._id)}>
                    {transaction.status === "pending" && "🟡 Chờ xử lý"}
                    {transaction.status === "completed" && "✅ Hoàn thành"}
                    {transaction.status === "cancelled" && "❌ Từ chối"}
                </Button>
              </div>
            </Card.Body>
            <Card.Footer className="text-end">
              <Button variant="info" size="sm" className="me-2" onClick={() => navigate(transaction.transactionType === "import" ? `/transaction/${transaction._id}` : `/export-detail/${transaction._id}`)}>Xem chi tiết</Button>
              {transaction.transactionType === "import" && (
                <Button variant="warning" size="sm" onClick={() => navigate(`/edit-transaction/${transaction._id}`)} disabled={transaction.status !== 'pending'}>Rà soát</Button>
              )}
            </Card.Footer>
          </Card>
        ))}
      </div>

      {/* Modal không cần thay đổi, nó đã responsive */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cập nhật trạng thái</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Giao dịch: <strong>{selectedTransaction?._id}</strong></p>
          <Form>
            <Form.Check type="radio" id="status-pending" label="🟡 Chờ xử lý" value="pending" checked={newStatus === "pending"} onChange={(e) => setNewStatus(e.target.value)} />
            <Form.Check type="radio" id="status-completed" label="✅ Hoàn thành" value="completed" checked={newStatus === "completed"} onChange={(e) => setNewStatus(e.target.value)} />
            <Form.Check type="radio" id="status-cancelled" label="❌ Từ chối" value="cancelled" checked={newStatus === "cancelled"} onChange={(e) => setNewStatus(e.target.value)} />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
          <Button variant="primary" onClick={handleStatusChange}>Xác nhận</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ListTransaction;