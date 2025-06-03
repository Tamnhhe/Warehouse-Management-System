import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Table } from 'react-bootstrap';
import { RiDeleteBack2Line } from "react-icons/ri";
import { IoAddCircleOutline } from "react-icons/io5";
import axios from 'axios';

function AddCategory() {
    const [categoryName, setCategoryName] = useState('');
    const [description, setDescription] = useState('');
    const [subcategories, setSubcategories] = useState([]);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    // Kiểm tra nếu tất cả các subcategory được điền thông tin
    const isAllSubcategoriesFilled = () => {
        return subcategories.every(sub => sub.name.trim() !== "" && sub.description.trim() !== "");
    };

    // Thêm danh mục
    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!categoryName.trim() || !description.trim() || !isAllSubcategoriesFilled()) {
            setError("Vui lòng điền đầy đủ thông tin trước khi thêm danh mục.");
            return;
        }
        try {
            const response = await axios.post('http://localhost:9999/categories/addCategory', {
                categoryName,
                description,
                classifications: subcategories,
            });
            // Xuất ra thống báo thêm danh mục thanh cong
            setMessage(response.data.message);
            setError(null);
            setCategoryName('');
            setDescription('');
            setSubcategories([]);
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi thêm danh mục. Vui lòng thử lại.');
            setMessage(null);
        }
    };

    // Thêm subcategory
    const handleAddSubcategory = () => {
        if (!isAllSubcategoriesFilled()) {
            setError("Vui lòng điền đầy đủ thông tin subcategory trước khi thêm mới.");
            return;
        }
        setSubcategories([...subcategories, { name: '', description: '' }]);
        setError(null);
    };

    // Cập nhật dữ liệu subcategory
    const handleUpdateSubcategory = (index, key, value) => {
        const updatedSubcategories = [...subcategories];
        updatedSubcategories[index][key] = value;
        setSubcategories(updatedSubcategories);
    };
    // Xóa subcategory
    const handleRemoveSubcategory = (index) => {
        const updatedSubcategories = subcategories.filter((_, i) => i !== index);
        setSubcategories(updatedSubcategories);
    };

    return (
        <Container fluid >
            <Row className="justify-content-md-center">
                <Col md={6}
                    style={{ backgroundColor: "#A8E6CF", margin: "20px", borderRadius: "10px", padding: "20px" }}
                >
                    <h2 className="mt-4">Thêm danh mục</h2>
                    {message && <Alert variant="success">{message}</Alert>}
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleAddCategory}>
                        <Form.Group className="mb-3">
                            <Form.Label>Tên danh mục</Form.Label>
                            <Form.Control
                                type="text"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Mô tả</Form.Label>
                            <Form.Control
                                as="textarea"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </Form.Group>
                        <h5>Thêm danh mục con</h5>
                        <Button variant="success" onClick={handleAddSubcategory} className="mb-3">
                            <IoAddCircleOutline style={{ fontSize: "1.5rem" }} />
                        </Button>
                        <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '10px' }}>
                            <Table bordered>
                                <thead>
                                    <tr>
                                        <th>Tên</th>
                                        <th>Mô tả</th>
                                        <th>Xóa</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subcategories.map((sub, index) => (
                                        <tr key={index}>
                                            <td>
                                                <Form.Control
                                                    type="text"
                                                    value={sub.name}
                                                    onChange={(e) => handleUpdateSubcategory(index, 'name', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <Form.Control
                                                    type="text"
                                                    value={sub.description}
                                                    onChange={(e) => handleUpdateSubcategory(index, 'description', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <Button variant="danger" size="sm" onClick={() => handleRemoveSubcategory(index)}>
                                                    <RiDeleteBack2Line />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>


                        <br />
                        <div className="d-flex justify-content-end">
                            <Button variant="primary" type="submit">
                                Thêm danh mục
                            </Button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}

export default AddCategory;