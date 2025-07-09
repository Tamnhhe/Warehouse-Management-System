//edit cate
import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Table, Alert } from "react-bootstrap";
import axios from "axios";

function EditCategory({ show, handleClose, category, updateCategoryList }) {
    const [categoryName, setCategoryName] = useState(category?.categoryName || "");
    const [description, setDescription] = useState(category?.description || "");
    const [subcategories, setSubcategories] = useState(category?.classifications || []);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (category) {
            setCategoryName(category.categoryName);
            setDescription(category.description);
            setSubcategories(category.classifications);
        }
    }, [category]);

    // Kiểm tra nếu tất cả các subcategory đã được điền thông tin
    const isAllSubcategoriesFilled = () => {
        return subcategories.every(sub => sub.name.trim() !== "" && sub.description.trim() !== "");
    };

    // Lưu danh mục & subcategory
    const handleSave = async () => {
        if (!categoryName || !description || !isAllSubcategoriesFilled()) {
            setErrorMessage("Vui lòng điền thông tin cho tất cả các trường trước khi lưu.");
            return;
        }

        try {
            await axios.put(`http://localhost:9999/categories/updateCategory/${category._id}`, {
                categoryName,
                description,
            });

            for (const sub of subcategories) {
                await handleSaveSubcategory(sub);
            }

            updateCategoryList({ ...category, categoryName, description, classifications: subcategories });

            handleClose();
        } catch (error) {
            console.error("Lỗi khi cập nhật danh mục:", error);
        }
    };

    // Lưu hoặc cập nhật subcategory
    const handleSaveSubcategory = async (sub) => {
        try {
            if (sub._id.toString().startsWith("temp_")) {
                await axios.post(`http://localhost:9999/categories/${category._id}/sub/add`, {
                    name: sub.name,
                    description: sub.description,
                });
            } else {
                await axios.put(`http://localhost:9999/categories/${category._id}/sub/update/${sub._id}`, {
                    name: sub.name,
                    description: sub.description,
                });
            }
        } catch (error) {
            console.error("Lỗi khi lưu subcategory:", error);
        }
    };

    // Thêm subcategory mới nếu tất cả subcategory cũ đã được điền thông tin
    const handleAddSubcategory = () => {

        if (isAllSubcategoriesFilled()) {
            setSubcategories([...subcategories, { _id: `temp_${Date.now()}`, name: "", description: "" }]);
            setErrorMessage(""); // Reset thông báo lỗi nếu thêm subcategory thành công
        } else {
            setErrorMessage("Vui lòng điền thông tin cho tất cả các subcategory trước khi thêm mới.");
        }
    };

    // Cập nhật dữ liệu subcategory
    const handleUpdateSubcategory = (index, key, value) => {
        const updatedSubcategories = [...subcategories];
        updatedSubcategories[index][key] = value;
        setSubcategories(updatedSubcategories);
    };

    // Xóa subcategory
    const handleDeleteSubcategory = async (subId) => {
        if (subId.toString().startsWith("temp_")) {
            setSubcategories(subcategories.filter(sub => sub._id !== subId));
            setConfirmDelete(null);
            return;
        }

        try {
            await axios.delete(`http://localhost:9999/categories/${category._id}/sub/delete/${subId}`);
            setSubcategories(subcategories.filter(sub => sub._id !== subId));
            setConfirmDelete(null);
        } catch (error) {
            console.error("Lỗi khi xóa subcategory:", error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered style={{ background: "rgba(0, 0, 0, 0.5)" }}>
            <div style={{ background: "#FEFEFE", boxShadow: "0px 10px 10px rgba(0,0,0,0.3)", borderRadius: "10px" }}>
                <Modal.Header closeButton>
                    <Modal.Title>Chỉnh sửa danh mục</Modal.Title>
                </Modal.Header>

                <Modal.Body style={{ backgroundColor: "#A8E6CF" }}>
                    {/* Thông báo lỗi nếu chưa điền đầy đủ thông tin */}
                    {errorMessage && (
                        <Alert variant="danger">
                            {errorMessage}
                        </Alert>
                    )}
                    <Form>
                        <Form.Group>
                            <Form.Label>Tên danh mục</Form.Label>
                            <Form.Control type="text" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
                        </Form.Group>
                        <Form.Group className="mt-3">
                            <Form.Label>Mô tả</Form.Label>
                            <Form.Control as="textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
                        </Form.Group>
                    </Form>
                    <h5 className="mt-4">Danh sách subcategory</h5>

                    <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #ddd", padding: "10px" }}>
                        <Table bordered style={{ borderRadius: "10px", overflow: "hidden" }}>
                            <thead>
                                <tr>
                                    <th>Tên</th>
                                    <th>Mô tả</th>
                                    <th>Xóa</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subcategories.map((sub, index) => (
                                    <tr key={sub._id}>
                                        <td>
                                            <Form.Control type="text" value={sub.name} onChange={(e) => handleUpdateSubcategory(index, "name", e.target.value)} />
                                        </td>
                                        <td>
                                            <Form.Control type="text" value={sub.description} onChange={(e) => handleUpdateSubcategory(index, "description", e.target.value)} />
                                        </td>
                                        <td>
                                            <Button variant="danger" size="sm" onClick={() => setConfirmDelete(sub._id)}>Xóa</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                    <Button variant="success" onClick={handleAddSubcategory}>Thêm subcategory</Button>
                </Modal.Body>
                <Modal.Footer style={{ backgroundColor: "#A8E6CF" }}>
                    <Button variant="secondary" onClick={handleClose}>Hủy</Button>
                    <Button variant="primary" onClick={handleSave}>Lưu</Button>
                </Modal.Footer>
            </div>

            {/* Modal xác nhận xóa */}
            {confirmDelete && (
                <Modal show={true} onHide={() => setConfirmDelete(null)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Xác nhận xóa</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Bạn có chắc chắn muốn xóa subcategory này không?</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Hủy</Button>
                        <Button variant="danger" onClick={() => handleDeleteSubcategory(confirmDelete)}>Xóa</Button>
                    </Modal.Footer>
                </Modal>
            )}
        </Modal>
    );
}

export default EditCategory;
