import React, { useEffect, useState } from "react";
import { Table, Container, Alert, Card, Button, Form } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import EditSuppliers from "./EditSuppliers";
const SupplierList = () => {
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState([]);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState({ "Còn cung cấp": false, "Ngừng cung cấp": false });
    const [editingSupplier, setEditingSupplier] = useState(null);
    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const response = await axios.get("http://localhost:9999/suppliers/get-list-suppliers");
                setSuppliers(response.data);
            } catch (error) {
                setError("Không thể tải dữ liệu danh sách nhà cung cấp.");
            }
        };
        fetchSuppliers();
    }, []);

    // Cập nhật trạng thái nhà cung cấp
    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await axios.put(`http://localhost:9999/suppliers/update-status/${id}`, { status: newStatus });
            const newSupplier = suppliers.map(s => s._id === id ? { ...s, status: newStatus } : s);
            setSuppliers(newSupplier);
        } catch (error) {
            console.log("Lỗi khi cập nhật trạng thái:", error);
        }
    };

    const handleFilterChange = (e) => {
        setFilterStatus({ ...filterStatus, [e.target.name]: e.target.checked });
    };

    // Lọc danh sách nhà cung cấp
    const filteredSuppliers = suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(search.toLowerCase()) &&
        (Object.values(filterStatus).some(value => value)
            ? filterStatus[supplier.status === "active" ? "Còn cung cấp" : "Ngừng cung cấp"]
            : true)
    );

    return (
        <Container className="mt-4">
            {error || suppliers.length === 0 ? (
                <Alert variant="danger" className="text-center">Không thể tải danh sách các nhà cung cấp</Alert>
            ) : (
                <Card className="shadow-sm p-3 mt-3" style={{ backgroundColor: "#A8E6CF" }}>
                    <Card.Body>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <Form className="d-flex gap-2 align-items-center">
                                <Form.Control
                                    type="text"
                                    placeholder="Tìm kiếm nhà cung cấp..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    style={{ maxWidth: "250px" }}
                                />
                                <div style={{ whiteSpace: "nowrap" }} className="d-flex gap-2">
                                    {["Còn cung cấp", "Ngừng cung cấp"].map((status) => (
                                        <Form.Check
                                            key={status}
                                            type="checkbox"
                                            label={status}
                                            name={status}
                                            checked={filterStatus[status]}
                                            onChange={handleFilterChange}
                                        />
                                    ))}
                                </div>
                            </Form>
                            <Button variant="primary" onClick={() => navigate("/manager/add-suppliers")}>
                                + Thêm nhà cung cấp
                            </Button>
                        </div>
                        <div style={{ overflowY: 'auto', maxHeight: '500px' }}>
                        <Table striped bordered hover responsive className="text-center" style={{ width: "100%", tableLayout: "fixed" }}>
                            <thead style={{ backgroundColor: "#A8E6CF", position: "sticky", top: 0, zIndex: 1 }}>
                                    <tr style={{position: "sticky", top: 0, zIndex: 3 }}>
                                        <th>#</th>
                                        <th style={{ whiteSpace: "nowrap" }}>Tên nhà cung cấp</th>
                                        <th>Địa chỉ</th>
                                        <th>Liên hệ</th>
                                        <th>Email</th>
                                        <th>Mô tả</th>
                                        <th style={{ whiteSpace: "nowrap" }}>Trạng thái</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSuppliers.length > 0 ? (
                                        filteredSuppliers.map((supplier, index) => (
                                            <React.Fragment key={index}>
                                                <tr>
                                                    <td>{index + 1}</td>
                                                    <td className="text-start">
                                                        {supplier.name}
                                                        <div className={supplier.status.toLowerCase() === "active" ? "text-success" : "text-danger"} style={{ fontSize: "0.85rem" }}>
                                                            {supplier.status === "active" ? "Còn cung cấp" : supplier.status === "inactive" ? "Ngừng cung cấp" : "Hiện đang dừng nguồn cung cấp từ doanh nghiệp này"}
                                                        </div>

                                                    </td>
                                                    <td>{supplier.address}</td>
                                                    <td>
                                                        {supplier.contact
                                                            ? ('0' + String(supplier.contact).replace(/\D/g, '')).replace(/^00/, '0')
                                                            : 'N/A'}
                                                    </td>

                                                    <td>{supplier.email}</td>
                                                    <td>{supplier.description}</td>
                                                    <td style={{ whiteSpace: "nowrap" }} className={supplier.status === "active" ? "text-success" : "text-danger"}>
                                                        {supplier.status === "active" ? "Còn cung cấp" : "Ngừng cung cấp"}
                                                    </td>
                                                    <td>
                                                        <div className="d-flex align-items-center justify-content-center gap-1">
                                                            <Button variant="warning" size="sm" onClick={() => setEditingSupplier(supplier)} style={{ opacity: supplier.status === "inactive" ? 0.5 : 1, padding: "2px 6px", fontSize: "0.8rem" }} disabled={supplier.status === "inactive"}>
                                                                Sửa
                                                            </Button>
                                                            {supplier.status === "active" ? (
                                                                <Button variant="danger" size="sm" onClick={() => handleUpdateStatus(supplier._id, "inactive")} style={{ padding: "2px 6px", fontSize: "0.8rem" }}>
                                                                    Ngừng cấp
                                                                </Button>
                                                            ) : (
                                                                <Button variant="success" size="sm" onClick={() => handleUpdateStatus(supplier._id, "active")} style={{ padding: "2px 6px", fontSize: "0.8rem" }} >
                                                                   Tái cấp
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            </React.Fragment>

                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center">Không tìm thấy nhà cung cấp nào</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>
                </Card>
            )}
            <EditSuppliers
                //truyen du lieu nguoi dung vao modalmodal
                user={editingSupplier}
                closeModal={() => setEditingSupplier(null)}
                //cap nhat danh sach nguoi dung sau khi chinh suasua
                users={suppliers}
                setUsers={setSuppliers}
            />
        </Container>
    );
};

export default SupplierList;
