import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Radio,
  Button,
  Alert,
  Typography,
  Avatar,
  Tag,
  Space,
  Row,
  Col,
  Divider,
  Card,
} from "antd";
import {
  CloseOutlined,
  SaveOutlined,
  UserOutlined,
  DollarOutlined,
  TeamOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

const modalVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 500,
    },
  },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      when: "beforeChildren",
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const EditUserModal = ({ user, closeModal, users, setUsers }) => {
  const [form] = Form.useForm();
  const [salary, setSalary] = useState(0);
  const [type, setType] = useState("parttime");
  const [workDays, setWorkDays] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [validateErrors, setValidateErrors] = useState({});

  useEffect(() => {
    if (user) {
      setSalary(user.salary || 0);
      setType(user.type || "parttime");
      setWorkDays(user.schedule?.workDays || []);
      if (user.type === "fulltime") {
        setShifts(["8:00AM - 17:00PM"]);
      } else {
        setShifts(user.schedule?.shifts || []);
      }

      // Set form values
      form.setFieldsValue({
        salary: user.salary || 0,
        type: user.type || "parttime",
        workDays: user.schedule?.workDays || [],
        shifts: user.schedule?.shifts?.[0] || "",
      });

      // Clear errors and messages
      setValidateErrors({});
      setSuccessMessage("");
      setErrorMessage("");
    }
  }, [user, form]);

  const toggleWorkDay = (day) => {
    const updatedDays = workDays.includes(day)
      ? workDays.filter((d) => d !== day)
      : [...workDays, day];

    setWorkDays(updatedDays);
    form.setFieldsValue({ workDays: updatedDays });
  };

  const handleSubmit = async () => {
    try {
      // Validate form with Ant Design form validation
      await form.validateFields();

      // Get values from form
      const values = form.getFieldsValue();

      // Reset messages
      setSuccessMessage("");
      setErrorMessage("");

      // Submit data
      await axios.put(`http://localhost:9999/users/update-user/${user._id}`, {
        salary: values.salary,
        type: values.type,
        workDays: values.workDays,
        shifts: [values.shifts], // API expects array
      });

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u._id === user._id
            ? {
                ...u,
                salary: values.salary,
                type: values.type,
                schedule: {
                  ...u.schedule,
                  workDays: values.workDays,
                  shifts: [values.shifts],
                },
              }
            : u
        )
      );

      setSuccessMessage("Cập nhật thông tin thành công!");

      // Close modal after success
      setTimeout(() => {
        setSuccessMessage("");
        closeModal();
      }, 1500);
    } catch (error) {
      if (error.errorFields) {
        // Form validation errors
        setErrorMessage("Vui lòng điền đầy đủ thông tin.");
      } else {
        // API errors
        console.error("Lỗi cập nhật thông tin người dùng:", error);
        setErrorMessage(error.response?.data?.message || "Đã có lỗi xảy ra!");
      }
    }
  };

  const dayMapping = {
    Monday: "T2",
    Tuesday: "T3",
    Wednesday: "T4",
    Thursday: "T5",
    Friday: "T6",
    Saturday: "T7",
    Sunday: "CN",
  };

  return (
    <Modal
      open={!!user}
      onCancel={closeModal}
      footer={null}
      width={750}
      bodyStyle={{ padding: 0 }}
      centered={true}
      closeIcon={null}
      maskStyle={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
      className="ant-modal-employee"
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "#48C1A6",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #f0f0f0",
          borderRadius: "2px 2px 0 0",
        }}
      >
        <Title level={4} style={{ margin: 0, color: "#fff" }}>
          Chỉnh sửa thông tin nhân viên
        </Title>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={closeModal}
          style={{ color: "#fff" }}
        />
      </div>

      {/* Content */}
      <AnimatePresence>
        {user && (
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
          >
            <div style={{ padding: "24px", backgroundColor: "#fff" }}>
              {successMessage && (
                <motion.div variants={itemVariants}>
                  <Alert
                    message={successMessage}
                    type="success"
                    showIcon
                    style={{ marginBottom: 24 }}
                  />
                </motion.div>
              )}

              {errorMessage && (
                <motion.div variants={itemVariants}>
                  <Alert
                    message={errorMessage}
                    type="error"
                    showIcon
                    style={{ marginBottom: 24 }}
                  />
                </motion.div>
              )}

              <Row gutter={24}>
                {/* User info sidebar */}
                <Col xs={24} sm={7}>
                  <motion.div
                    variants={itemVariants}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      padding: "20px",
                      backgroundColor: "#f9f9f9",
                      borderRadius: "8px",
                    }}
                  >
                    <Avatar
                      size={100}
                      icon={<UserOutlined />}
                      style={{
                        backgroundColor:
                          user?.profile?.gender === "male"
                            ? "#1890ff"
                            : "#ff6b81",
                        marginBottom: 16,
                      }}
                    />
                    <Text strong style={{ fontSize: 16, marginBottom: 8 }}>
                      {user?.fullName}
                    </Text>
                    <Text type="secondary" style={{ marginBottom: 16 }}>
                      {user?.account?.email}
                    </Text>
                    <Tag
                      color={user?.status === "active" ? "success" : "error"}
                    >
                      {user?.status === "active" ? "Hoạt động" : "Bị khóa"}
                    </Tag>
                  </motion.div>
                </Col>

                {/* Form content */}
                <Col xs={24} sm={17}>
                  <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                      salary: salary,
                      type: type,
                      workDays: workDays,
                      shifts: shifts[0] || "",
                    }}
                  >
                    <Row gutter={16}>
                      {/* Salary */}
                      <Col xs={24} sm={12}>
                        <motion.div variants={itemVariants}>
                          <Form.Item
                            label="Mức lương (VND)"
                            name="salary"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng nhập mức lương",
                              },
                              {
                                type: "number",
                                min: 1,
                                message: "Lương phải lớn hơn 0",
                              },
                              {
                                validator: (_, value) => {
                                  if (value && !Number.isInteger(value)) {
                                    return Promise.reject(
                                      new Error("Lương phải là số nguyên")
                                    );
                                  }
                                  return Promise.resolve();
                                },
                              },
                            ]}
                          >
                            <InputNumber
                              style={{ width: "100%" }}
                              prefix={<DollarOutlined />}
                              formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                              }
                              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                              onChange={(value) => setSalary(value)}
                              step={1}
                              min={1}
                              precision={0} // Không cho nhập số thập phân
                            />
                          </Form.Item>
                        </motion.div>
                      </Col>

                      {/* Employee Type */}
                      <Col xs={24} sm={12}>
                        <motion.div variants={itemVariants}>
                          <Form.Item label="Loại nhân viên" name="type">
                            <Select
                              onChange={(value) => setType(value)}
                              suffixIcon={<TeamOutlined />}
                            >
                              <Option value="fulltime">Toàn thời gian</Option>
                              <Option value="parttime">Bán thời gian</Option>
                            </Select>
                          </Form.Item>
                        </motion.div>
                      </Col>

                      {/* Work Days */}
                      <Col xs={24}>
                        <motion.div variants={itemVariants}>
                          <Form.Item
                            label="Ngày làm việc"
                            name="workDays"
                            rules={[
                              {
                                required: true,
                                message:
                                  "Vui lòng chọn ít nhất một ngày làm việc",
                              },
                            ]}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "8px",
                              }}
                            >
                              {Object.entries(dayMapping).map(
                                ([day, shortDay]) => (
                                  <Tag
                                    key={day}
                                    color={
                                      workDays.includes(day)
                                        ? "#48C1A6"
                                        : "default"
                                    }
                                    style={{
                                      padding: "5px 10px",
                                      cursor: "pointer",
                                      borderRadius: "4px",
                                    }}
                                    onClick={() => toggleWorkDay(day)}
                                  >
                                    {shortDay}
                                  </Tag>
                                )
                              )}
                            </div>
                          </Form.Item>
                        </motion.div>
                      </Col>

                      {/* Work Hours/Shifts */}
                      <Col xs={24}>
                        <motion.div variants={itemVariants}>
                          <Form.Item
                            label="Ca làm việc"
                            name="shifts"
                            rules={[
                              {
                                required: type === "parttime",
                                message: "Vui lòng chọn ca làm việc",
                              },
                            ]}
                          >
                            {type === "fulltime" ? (
                              <Card
                                size="small"
                                style={{ backgroundColor: "#f9f9f9" }}
                                title={
                                  <span>
                                    <ClockCircleOutlined /> Giờ làm việc
                                  </span>
                                }
                              >
                                <Text>8:00AM - 17:00PM (Toàn thời gian)</Text>
                              </Card>
                            ) : (
                              <Radio.Group
                                onChange={(e) => setShifts([e.target.value])}
                              >
                                <Space direction="vertical">
                                  <Radio value="Morning">
                                    Sáng (08:00 - 11:00)
                                  </Radio>
                                  <Radio value="Afternoon">
                                    Chiều (13:00 - 17:00)
                                  </Radio>
                                  <Radio value="Evening">
                                    Tối (17:00 - 21:00)
                                  </Radio>
                                </Space>
                              </Radio.Group>
                            )}
                          </Form.Item>
                        </motion.div>
                      </Col>
                    </Row>
                  </Form>
                </Col>
              </Row>
            </div>

            <Divider style={{ margin: 0 }} />

            {/* Footer */}
            <div
              style={{
                padding: "16px 24px",
                textAlign: "right",
                backgroundColor: "#fff",
              }}
            >
              <Space>
                <Button onClick={closeModal}>Hủy</Button>
                <Button
                  type="primary"
                  onClick={handleSubmit}
                  icon={<SaveOutlined />}
                  style={{ backgroundColor: "#48C1A6", borderColor: "#48C1A6" }}
                >
                  Lưu thay đổi
                </Button>
              </Space>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
};

export default EditUserModal;
