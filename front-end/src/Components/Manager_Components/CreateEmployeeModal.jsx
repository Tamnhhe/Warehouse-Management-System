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
  DatePicker,
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
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  IdcardOutlined,
  DollarOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

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

const CreateEmployeeModal = ({ open, handleClose, onCreateSuccess }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    avatar: "",
    dob: "",
    address: "",
    gender: "male",
    idCard: "",
    salary: "",
    role: "employee",
    type: "",
    workDays: [],
    shifts: [],
    startTime: "",
    endTime: "",
  });

  const [statusMessage, setStatusMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [validateErrors, setValidateErrors] = useState({});

  useEffect(() => {
    if (open) {
      // Reset form when modal is opened
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    form.resetFields();
    setFormData({
      fullName: "",
      email: "",
      phoneNumber: "",
      avatar: "",
      dob: "",
      address: "",
      gender: "male",
      idCard: "",
      salary: "",
      role: "employee",
      type: "",
      workDays: [],
      shifts: [],
      startTime: "",
      endTime: "",
    });
    setValidateErrors({});
    setStatusMessage("");
    setIsError(false);
  };

  useEffect(() => {
    if (formData.type === "fulltime") {
      setFormData((prev) => ({
        ...prev,
        startTime: "08:00",
        endTime: "17:00",
      }));
      form.setFieldsValue({
        startTime: "08:00",
        endTime: "17:00",
      });
    }
  }, [formData.type, form]);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const toggleWorkDay = (day) => {
    const updatedDays = formData.workDays.includes(day)
      ? formData.workDays.filter((d) => d !== day)
      : [...formData.workDays, day];

    setFormData((prev) => ({
      ...prev,
      workDays: updatedDays,
    }));

    form.setFieldsValue({ workDays: updatedDays });
  };

  const calculateAge = (dob) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const handleSubmit = async () => {
    try {
      // Validate form with Ant Design form validation
      await form.validateFields();

      // Format data correctly
      const values = form.getFieldsValue();
      const submittedData = {
        ...formData,
        ...values,
        dob: values.dob ? values.dob.format("YYYY-MM-DD") : "",
      };

      // Reset messages
      setIsError(false);
      setStatusMessage("");

      const response = await axios.post(
        "http://localhost:9999/users/add-employee",
        submittedData
      );

      setStatusMessage(response.data.message || "Tạo nhân viên thành công!");
      setIsError(false);

      if (response.data && response.data.user) {
        // Call the success callback with the new user
        onCreateSuccess(response.data.user);
      }

      // Close modal after successful submission
      setTimeout(() => {
        handleClose();
        resetForm();
      }, 1500);
    } catch (error) {
      if (error.errorFields) {
        // Form validation errors
        setIsError(true);
        setStatusMessage("Vui lòng điền đầy đủ thông tin.");
      } else {
        // API errors
        setIsError(true);
        const errorMessage =
          error.response?.data?.message || "Đã có lỗi xảy ra!";
        setStatusMessage(errorMessage);
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

  const validateAge = (_, value) => {
    if (value && calculateAge(value.toDate()) < 18) {
      return Promise.reject(new Error("Nhân viên phải từ 18 tuổi trở lên"));
    }
    return Promise.resolve();
  };

  const validateIdCard = (_, value) => {
    if (value && value.length !== 12) {
      return Promise.reject(new Error("Số căn cước phải có đủ 12 số"));
    }
    return Promise.resolve();
  };

  const validatePhone = (_, value) => {
    if (value && !/^[0-9]{10}$/.test(value)) {
      return Promise.reject(new Error("Số điện thoại phải có 10 chữ số"));
    }
    return Promise.resolve();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={800}
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
          Thêm nhân viên mới
        </Title>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={handleClose}
          style={{ color: "#fff" }}
        />
      </div>

      {/* Content */}
      <motion.div variants={contentVariants} initial="hidden" animate="visible">
        <div style={{ padding: "24px", backgroundColor: "#fff" }}>
          {statusMessage && (
            <Alert
              message={statusMessage}
              type={isError ? "error" : "success"}
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <Row gutter={24}>
            {/* Avatar Section */}
            <Col xs={24} sm={6}>
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
                  src="https://res.cloudinary.com/ds9p5t0mx/image/upload/v1740308752/avatar-default-icon-1975x2048-2mpk4u9k_fjciku.png"
                  size={120}
                  style={{ marginBottom: 16 }}
                />
                <Text type="secondary" style={{ textAlign: "center" }}>
                  Hình ảnh mặc định sẽ được sử dụng
                </Text>
              </motion.div>
            </Col>

            {/* Form Section */}
            <Col xs={24} sm={18}>
              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  gender: "male",
                  workDays: [],
                }}
              >
                <Row gutter={16}>
                  {/* Full Name */}
                  <Col xs={24} sm={12}>
                    <motion.div variants={itemVariants}>
                      <Form.Item
                        label="Họ tên"
                        name="fullName"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập tên nhân viên",
                          },
                        ]}
                      >
                        <Input
                          prefix={<UserOutlined />}
                          placeholder="Nhập họ tên"
                          onChange={(e) =>
                            handleChange("fullName", e.target.value)
                          }
                        />
                      </Form.Item>
                    </motion.div>
                  </Col>

                  {/* Email */}
                  <Col xs={24} sm={12}>
                    <motion.div variants={itemVariants}>
                      <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                          { required: true, message: "Vui lòng nhập email" },
                          { type: "email", message: "Email không hợp lệ" },
                        ]}
                      >
                        <Input
                          prefix={<MailOutlined />}
                          placeholder="Nhập email"
                          onChange={(e) =>
                            handleChange("email", e.target.value)
                          }
                        />
                      </Form.Item>
                    </motion.div>
                  </Col>

                  {/* Phone */}
                  <Col xs={24} sm={12}>
                    <motion.div variants={itemVariants}>
                      <Form.Item
                        label="Số điện thoại"
                        name="phoneNumber"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập số điện thoại",
                          },
                          { validator: validatePhone },
                        ]}
                      >
                        <Input
                          prefix={<PhoneOutlined />}
                          placeholder="Nhập số điện thoại"
                          onChange={(e) =>
                            handleChange("phoneNumber", e.target.value)
                          }
                        />
                      </Form.Item>
                    </motion.div>
                  </Col>

                  {/* DOB */}
                  <Col xs={24} sm={12}>
                    <motion.div variants={itemVariants}>
                      <Form.Item
                        label="Ngày sinh"
                        name="dob"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn ngày sinh",
                          },
                          { validator: validateAge },
                        ]}
                      >
                        <DatePicker
                          style={{ width: "100%" }}
                          placeholder="Chọn ngày sinh"
                          format="DD/MM/YYYY"
                          onChange={(date) =>
                            handleChange(
                              "dob",
                              date ? date.format("YYYY-MM-DD") : ""
                            )
                          }
                          suffixIcon={<CalendarOutlined />}
                        />
                      </Form.Item>
                    </motion.div>
                  </Col>

                  {/* Address */}
                  <Col xs={24} sm={12}>
                    <motion.div variants={itemVariants}>
                      <Form.Item
                        label="Địa chỉ"
                        name="address"
                        rules={[
                          { required: true, message: "Vui lòng nhập địa chỉ" },
                        ]}
                      >
                        <Input
                          prefix={<HomeOutlined />}
                          placeholder="Nhập địa chỉ"
                          onChange={(e) =>
                            handleChange("address", e.target.value)
                          }
                        />
                      </Form.Item>
                    </motion.div>
                  </Col>

                  {/* ID Card */}
                  <Col xs={24} sm={12}>
                    <motion.div variants={itemVariants}>
                      <Form.Item
                        label="Số căn cước"
                        name="idCard"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập số căn cước",
                          },
                          { validator: validateIdCard },
                        ]}
                      >
                        <Input
                          prefix={<IdcardOutlined />}
                          placeholder="Nhập số căn cước"
                          onChange={(e) =>
                            handleChange("idCard", e.target.value)
                          }
                        />
                      </Form.Item>
                    </motion.div>
                  </Col>

                  {/* Gender */}
                  <Col xs={24} sm={12}>
                    <motion.div variants={itemVariants}>
                      <Form.Item label="Giới tính" name="gender">
                        <Radio.Group
                          onChange={(e) =>
                            handleChange("gender", e.target.value)
                          }
                        >
                          <Radio value="male">Nam</Radio>
                          <Radio value="female">Nữ</Radio>
                        </Radio.Group>
                      </Form.Item>
                    </motion.div>
                  </Col>

                  {/* Salary */}
                  <Col xs={24} sm={12}>
                    <motion.div variants={itemVariants}>
                      <Form.Item
                        label="Lương (VND)"
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
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          prefix={<DollarOutlined />}
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                          placeholder="Nhập mức lương"
                          onChange={(value) => handleChange("salary", value)}
                        />
                      </Form.Item>
                    </motion.div>
                  </Col>

                  {/* Contract Type */}
                  <Col xs={24} sm={12}>
                    <motion.div variants={itemVariants}>
                      <Form.Item
                        label="Loại hợp đồng"
                        name="type"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn loại hợp đồng",
                          },
                        ]}
                      >
                        <Select
                          placeholder="Chọn loại hợp đồng"
                          onChange={(value) => handleChange("type", value)}
                          suffixIcon={<TeamOutlined />}
                        >
                          <Option value="fulltime">Toàn thời gian</Option>
                          <Option value="parttime">Bán thời gian</Option>
                        </Select>
                      </Form.Item>
                    </motion.div>
                  </Col>

                  {/* Work Days */}
                  {formData.type && (
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
                                    formData.workDays.includes(day)
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
                  )}

                  {/* Work Hours - Fulltime */}
                  {formData.type === "fulltime" && (
                    <Col xs={24}>
                      <motion.div variants={itemVariants}>
                        <Card
                          size="small"
                          style={{ backgroundColor: "#f9f9f9" }}
                          title={
                            <span>
                              <ClockCircleOutlined /> Giờ làm việc
                            </span>
                          }
                        >
                          <Row gutter={16}>
                            <Col xs={24} sm={12}>
                              <Form.Item label="Giờ bắt đầu" name="startTime">
                                <Input value="08:00" disabled />
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                              <Form.Item label="Giờ kết thúc" name="endTime">
                                <Input value="17:00" disabled />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Card>
                      </motion.div>
                    </Col>
                  )}

                  {/* Shifts - Part-time */}
                  {formData.type === "parttime" && (
                    <Col xs={24}>
                      <motion.div variants={itemVariants}>
                        <Form.Item
                          label="Ca làm việc"
                          name="shifts"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn ca làm việc",
                            },
                          ]}
                        >
                          <Radio.Group
                            onChange={(e) => {
                              const shift = e.target.value;
                              let startTime, endTime;

                              // Set time based on selected shift
                              if (shift === "Morning") {
                                startTime = "08:00";
                                endTime = "11:00";
                              } else if (shift === "Afternoon") {
                                startTime = "13:00";
                                endTime = "17:00";
                              } else if (shift === "Evening") {
                                startTime = "17:00";
                                endTime = "21:00";
                              }

                              setFormData({
                                ...formData,
                                shifts: [shift],
                                startTime,
                                endTime,
                              });
                            }}
                          >
                            <Space direction="vertical">
                              <Radio value="Morning">
                                Sáng (08:00 - 11:00)
                              </Radio>
                              <Radio value="Afternoon">
                                Chiều (13:00 - 17:00)
                              </Radio>
                              <Radio value="Evening">Tối (17:00 - 21:00)</Radio>
                            </Space>
                          </Radio.Group>
                        </Form.Item>
                      </motion.div>
                    </Col>
                  )}
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
            <Button onClick={handleClose}>Hủy</Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              icon={<SaveOutlined />}
              style={{ backgroundColor: "#48C1A6", borderColor: "#48C1A6" }}
            >
              Tạo nhân viên
            </Button>
          </Space>
        </div>
      </motion.div>
    </Modal>
  );
};

export default CreateEmployeeModal;
