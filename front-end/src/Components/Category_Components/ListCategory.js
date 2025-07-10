//list cate
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Table, Modal } from 'react-bootstrap';
import { AiOutlineSortDescending, AiOutlineSortAscending } from "react-icons/ai";
import { CiSquareMore } from "react-icons/ci";
import axios from 'axios';
import EditCategory from './EditCategory';
import { useNavigate } from 'react-router-dom';
function ListCategory() {
    const [cate, setCate] = useState([]);
    const [filterCate, setFilterCate] = useState("");
    const [isActiveFirst, setIsActiveFirst] = useState(true);
    const [sortDirection, setSortDirection] = useState("asc");
    const [error, setError] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCate = async () => {
            try {
                const response = await axios.get("http://localhost:9999/categories/getAllCategories");
                setCate(response.data);
            } catch (error) {
                setError("Unable to load category list.");
            }
        };
        fetchCate();
    }, []);

    const handleNavigate = () => {
        navigate('/category/add-category');
    };

    //xắp xếp tên theo bảng chữ cái
    const handleSort = () => {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    };

    //xắp xếp theo status
    const handleCheckboxChange = () => {
        setIsActiveFirst(!isActiveFirst);
    };

    // Mở cửa sổ chỉnh sửa danh mục
    const handleEditClick = (category) => {
        setSelectedCategory(category);
        setShowEditModal(true);
    };

    // Đóng cửa sổ chỉnh sửa danh mục
    const handleCloseModal = () => {
        setShowEditModal(false);
        setSelectedCategory(null);
    };

    // Mở cửa sổ xem danh sách subcategory
    const handleShowSubcategories = (category) => {
        setSelectedCategory(category);
        setShowSubcategoryModal(true);  // Modal cho subcategory
    };

    // Đóng cửa sổ xem danh sách subcategory
    const handleCloseSubcategoryModal = () => {
        setShowSubcategoryModal(false);
        setSelectedCategory(null);
    };


    //render lại
    const updateCategoryList = (updatedCategory) => {
        setCate(cate.map(c => c._id === updatedCategory._id ? updatedCategory : c));
    };

    //cập nhật trạng thái
    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await axios.put(`http://localhost:9999/categories/inactivateCategory/${id}`, { status: newStatus });
            const newCate = cate.map(c => c._id === id ? { ...c, status: newStatus } : c);
            setCate(newCate);
        } catch (error) {
            console.log("Lỗi khi cập nhật trạng thái:", error);
        }
    };
    //cập nhật danh mục theo filter hoặc searh
    const filteredCate = [...cate]
        .filter((f) =>
            f.categoryName.toLowerCase().includes(filterCate.toLowerCase())
        )
        .sort((a, b) => {
            // Sắp xếp theo tên danh mục
            if (sortDirection === "asc") {
                return a.categoryName.localeCompare(b.categoryName);
            } else {
                return b.categoryName.localeCompare(a.categoryName);
            }
        })
        .sort((a, b) => {
            // Sắp xếp theo trạng thái
            if (isActiveFirst) {
                return a.status === "active" ? -1 : 1;
            } else {
                return a.status === "inactive" ? -1 : 1;
            }
        });

    return (
        <Container fluid style={{ backgroundColor: "#A8E6CF", margin: "20px", borderRadius: "10px", maxWidth: "97%" }}>

            <Row className="justify-content-end" style={{ margin: "0px 10px" }}>
                <Button
                    style={{ width: '150px', margin: '5px 0px' }}
                    onClick={handleNavigate}
                >
                    Tạo danh mục
                </Button>
            </Row>
            <Row>
                <Col md={12} style={{ marginBottom: "10px" }}>
                    <Form.Control
                        type="text"
                        value={filterCate}
                        onChange={(e) => setFilterCate(e.target.value)}
                        placeholder="Tìm theo tên danh mục"
                    />
                </Col>
            </Row>
            <Row>
                <Col md={12} >
                    <div style={{ overflowY: 'auto', maxHeight: '550px' }}>
                        {filteredCate.length > 0 ? (
                            <Table striped bordered hover style={{ width: "100%", tableLayout: "fixed", borderRadius: "10px" }}>
                                <thead style={{ position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 1 }}>
                                    <tr>
                                        <th onClick={handleSort}>
                                            Tên danh mục {sortDirection === "asc" ? <AiOutlineSortDescending /> : <AiOutlineSortAscending />}
                                        </th>
                                        <th>Danh mục con</th>
                                        <th style={{ display: "flex", alignItems: "center" }}>
                                            Trạng thái
                                            <Form.Check
                                                type="checkbox"
                                                checked={isActiveFirst}
                                                onChange={handleCheckboxChange}
                                                style={{ marginLeft: "10px" }}
                                            />
                                        </th>
                                        <th>Mô tả</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCate.map((f) => (
                                        <tr key={f._id}>
                                            <td>{f.categoryName}</td>
                                            <td>
                                                {f.classifications.length > 0 ? (
                                                    <>
                                                        {f.classifications.slice(0, 1).map((classification) => (
                                                            <div key={classification._id}>
                                                                {classification.name}
                                                            </div>
                                                        ))}
                                                        {f.classifications.length > 1 && (
                                                            <span
                                                                style={{ color: 'blue', cursor: 'pointer' }}
                                                                onClick={() => handleShowSubcategories(f)}
                                                            >
                                                                <CiSquareMore />
                                                            </span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span>Không có danh mục con</span>
                                                )}
                                            </td>
                                            <td>{f.status === "active" ? "Kích hoạt" : "Vô hiệu hóa"}</td>
                                            <td>{f.description}</td>
                                            <td>
                                                <Button
                                                    variant="warning"
                                                    size="sm"
                                                    onClick={() => handleEditClick(f)}
                                                >
                                                    Chỉnh sửa
                                                </Button>{' '}
                                                {f.status === 'active' ? (
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleUpdateStatus(f._id, "inactive")}
                                                    >
                                                        Vô hiệu hóa
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        onClick={() => handleUpdateStatus(f._id, "active")}
                                                    >
                                                        Kích hoạt
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        ) : (
                            <p style={{ fontSize: '18px', marginLeft: '30px' }}>Không tìm thấy danh mục có tên "{filterCate}", vui lòng nhập lại tên danh mục</p>
                        )}

                    </div>

                </Col>
            </Row>
            {showEditModal && (
                <EditCategory
                    show={showEditModal}
                    handleClose={handleCloseModal}
                    category={selectedCategory}
                    updateCategoryList={updateCategoryList}
                />
            )}
            {showSubcategoryModal && (
                <Modal
                    show={showSubcategoryModal}
                    onHide={handleCloseSubcategoryModal}
                    centered
                    size="lg"
                >
                    <Modal.Header closeButton >
                        <Modal.Title>Danh sách danh mục con</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ backgroundColor: "#A8E6CF" }}>
                        <Table striped bordered hover style={{ borderRadius: "10px", overflow: "hidden" }}>
                            <thead>
                                <tr>
                                    <th>Tên</th>
                                    <th>Mô tả</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedCategory?.classifications?.map((sub, index) => (
                                    <tr key={sub._id}>
                                        <td>{sub.name}</td>
                                        <td>{sub.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>

                    </Modal.Body>
                </Modal>
            )}
        </Container>
    );
}

export default ListCategory;
