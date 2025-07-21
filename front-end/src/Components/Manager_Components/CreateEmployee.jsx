import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  Avatar,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Chip,
  Paper,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  ArrowBack,
  Save,
  AccessTime,
  CalendarMonth,
  Person,
  Email,
  Phone,
  LocationOn,
  CreditCard,
  Work,
  AttachMoney,
} from "@mui/icons-material";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

function CreateEmployee() {
  const navigate = useNavigate();
  const [data, setFormData] = useState({
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
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...data, [name]: value });

    // Clear validation error when field is being edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  useEffect(() => {
    if (data.type === "fulltime") {
      setFormData((prev) => ({
        ...prev,
        startTime: "08:00",
        endTime: "17:00",
      }));
    }
  }, [data.type]);

  // Toggle work day selection
  const toggleWorkDay = (day) => {
    setFormData((prevData) => {
      const updatedDays = prevData.workDays.includes(day)
        ? prevData.workDays.filter((d) => d !== day)
        : [...prevData.workDays, day];
      return { ...prevData, workDays: updatedDays };
    });

    // Clear workDays validation error when selection changes
    if (errors.workDays) {
      setErrors((prev) => ({ ...prev, workDays: "" }));
    }
  };

  // Ham tinh tuoi
  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validate fullName
    if (!data.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập tên nhân viên";
      isValid = false;
    }

    // Validate email
    if (!data.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = "Email không hợp lệ";
      isValid = false;
    }

    // Validate phone
    if (!data.phoneNumber.trim()) {
      newErrors.phoneNumber = "Vui lòng nhập số điện thoại";
      isValid = false;
    } else if (!/^[0-9]{10}$/.test(data.phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại phải có 10 chữ số";
      isValid = false;
    }

    // Validate DOB
    if (!data.dob) {
      newErrors.dob = "Vui lòng chọn ngày sinh";
      isValid = false;
    } else if (calculateAge(data.dob) < 18) {
      newErrors.dob = "Nhân viên phải từ 18 tuổi trở lên";
      isValid = false;
    }

    // Validate address
    if (!data.address.trim()) {
      newErrors.address = "Vui lòng nhập địa chỉ";
      isValid = false;
    }

    // Validate ID card
    if (!data.idCard.trim()) {
      newErrors.idCard = "Vui lòng nhập số căn cước";
      isValid = false;
    } else if (data.idCard.length !== 12) {
      newErrors.idCard = "Số căn cước phải có đủ 12 số";
      isValid = false;
    }

    // Validate salary
    if (!data.salary) {
      newErrors.salary = "Vui lòng nhập mức lương";
      isValid = false;
    } else if (parseFloat(data.salary) <= 0) {
      newErrors.salary = "Lương phải lớn hơn 0";
      isValid = false;
    }

    // Validate type
    if (!data.type) {
      newErrors.type = "Vui lòng chọn loại hợp đồng";
      isValid = false;
    }

    // Validate workdays
    if (data.workDays.length === 0) {
      newErrors.workDays = "Vui lòng chọn ít nhất một ngày làm việc";
      isValid = false;
    }

    // Validate shifts for part-time
    if (data.type === "parttime" && data.shifts.length === 0) {
      newErrors.shifts = "Vui lòng chọn ca làm việc";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset messages
    setIsError(false);
    setStatusMessage("");

    // Validate form
    if (!validateForm()) {
      setIsError(true);
      setStatusMessage("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:9999/users/add-employee",
        data
      );
      setStatusMessage(response.data.message || "Tạo nhân viên thành công!");
      setIsError(false);

      // Reset form after successful submission
      setTimeout(() => {
        navigate("/manager/get-all-user");
      }, 2000);
    } catch (error) {
      setIsError(true);
      const errorMessage = error.response?.data?.message || "Đã có lỗi xảy ra!";
      setStatusMessage(errorMessage);
    }
  };

  const handleSalaryChange = (e) => {
    const value = Math.max(0, e.target.value);
    setFormData({ ...data, salary: value });

    // Clear salary validation error
    if (errors.salary) {
      setErrors((prev) => ({ ...prev, salary: "" }));
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
    <Box
      sx={{
        background:
          "url('/images/backgroundLogin.jpg') no-repeat center center / cover",
        minHeight: "100vh",
        py: 4,
      }}
    >
      <Container>
        <Button
          component={Link}
          to="/manager/get-all-user"
          startIcon={<ArrowBack />}
          sx={{
            color: "#48C1A6",
            fontSize: "16px",
            mb: 2,
          }}
        >
          Trở về danh sách nhân viên
        </Button>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <Card
            component={motion.div}
            variants={fadeIn}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            }}
          >
            <Grid container>
              {/* Left sidebar */}
              <Grid
                item
                xs={12}
                md={3}
                sx={{
                  backgroundColor: "#7BD1C2",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 4,
                }}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Avatar
                    src="https://res.cloudinary.com/ds9p5t0mx/image/upload/v1740308752/avatar-default-icon-1975x2048-2mpk4u9k_fjciku.png"
                    alt="Avatar"
                    sx={{ width: 180, height: 180, mb: 2 }}
                  />
                </motion.div>

                <Typography
                  variant="h6"
                  color="white"
                  fontWeight="bold"
                  textAlign="center"
                >
                  Thêm nhân viên mới
                </Typography>
              </Grid>

              {/* Form content */}
              <Grid item xs={12} md={9}>
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{ fontWeight: 600, mb: 3 }}
                  >
                    Tạo mới nhân viên
                  </Typography>

                  {statusMessage && (
                    <Alert
                      severity={isError ? "error" : "success"}
                      sx={{ mb: 3 }}
                    >
                      {statusMessage}
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit}>
                    <motion.div
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                    >
                      <Grid container spacing={3}>
                        {/* Full Name */}
                        <Grid
                          item
                          xs={12}
                          md={6}
                          component={motion.div}
                          variants={fadeIn}
                        >
                          <TextField
                            fullWidth
                            label="Họ Tên"
                            name="fullName"
                            value={data.fullName}
                            onChange={handleChange}
                            required
                            error={!!errors.fullName}
                            helperText={errors.fullName}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Person />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        {/* Email */}
                        <Grid
                          item
                          xs={12}
                          md={6}
                          component={motion.div}
                          variants={fadeIn}
                        >
                          <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={data.email}
                            onChange={handleChange}
                            required
                            error={!!errors.email}
                            helperText={errors.email}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Email />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        {/* Phone */}
                        <Grid
                          item
                          xs={12}
                          md={6}
                          component={motion.div}
                          variants={fadeIn}
                        >
                          <TextField
                            fullWidth
                            label="Số điện thoại"
                            name="phoneNumber"
                            value={data.phoneNumber}
                            onChange={handleChange}
                            required
                            error={!!errors.phoneNumber}
                            helperText={errors.phoneNumber}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Phone />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        {/* DOB */}
                        <Grid
                          item
                          xs={12}
                          md={6}
                          component={motion.div}
                          variants={fadeIn}
                        >
                          <TextField
                            fullWidth
                            label="Ngày sinh"
                            name="dob"
                            type="date"
                            value={data.dob}
                            onChange={handleChange}
                            required
                            error={!!errors.dob}
                            helperText={errors.dob}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <CalendarMonth />
                                </InputAdornment>
                              ),
                            }}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>

                        {/* Address */}
                        <Grid
                          item
                          xs={12}
                          md={6}
                          component={motion.div}
                          variants={fadeIn}
                        >
                          <TextField
                            fullWidth
                            label="Địa chỉ"
                            name="address"
                            value={data.address}
                            onChange={handleChange}
                            required
                            error={!!errors.address}
                            helperText={errors.address}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LocationOn />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        {/* ID Card */}
                        <Grid
                          item
                          xs={12}
                          md={6}
                          component={motion.div}
                          variants={fadeIn}
                        >
                          <TextField
                            fullWidth
                            label="Số căn cước"
                            name="idCard"
                            value={data.idCard}
                            onChange={handleChange}
                            required
                            error={!!errors.idCard}
                            helperText={errors.idCard}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <CreditCard />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        {/* Gender */}
                        <Grid
                          item
                          xs={12}
                          md={6}
                          component={motion.div}
                          variants={fadeIn}
                        >
                          <FormControl component="fieldset">
                            <FormLabel component="legend">Giới tính</FormLabel>
                            <RadioGroup
                              row
                              name="gender"
                              value={data.gender}
                              onChange={handleChange}
                            >
                              <FormControlLabel
                                value="male"
                                control={<Radio />}
                                label="Nam"
                              />
                              <FormControlLabel
                                value="female"
                                control={<Radio />}
                                label="Nữ"
                              />
                            </RadioGroup>
                          </FormControl>
                        </Grid>

                        {/* Salary */}
                        <Grid
                          item
                          xs={12}
                          md={6}
                          component={motion.div}
                          variants={fadeIn}
                        >
                          <TextField
                            fullWidth
                            label="Lương (VND)"
                            name="salary"
                            type="number"
                            value={data.salary}
                            onChange={handleSalaryChange}
                            required
                            error={!!errors.salary}
                            helperText={errors.salary}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <AttachMoney />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        {/* Contract Type */}
                        <Grid
                          item
                          xs={12}
                          md={6}
                          component={motion.div}
                          variants={fadeIn}
                        >
                          <FormControl fullWidth error={!!errors.type}>
                            <InputLabel>Loại hợp đồng</InputLabel>
                            <Select
                              name="type"
                              value={data.type}
                              onChange={handleChange}
                              required
                              startAdornment={
                                <InputAdornment position="start">
                                  <Work />
                                </InputAdornment>
                              }
                            >
                              <MenuItem value="">Chọn loại hợp đồng</MenuItem>
                              <MenuItem value="fulltime">
                                Toàn thời gian
                              </MenuItem>
                              <MenuItem value="parttime">
                                Bán thời gian
                              </MenuItem>
                            </Select>
                            {errors.type && (
                              <FormHelperText>{errors.type}</FormHelperText>
                            )}
                          </FormControl>
                        </Grid>

                        {/* Work days selection */}
                        {data.type && (
                          <Grid
                            item
                            xs={12}
                            component={motion.div}
                            variants={fadeIn}
                          >
                            <FormControl
                              component="fieldset"
                              error={!!errors.workDays}
                              fullWidth
                            >
                              <FormLabel component="legend">
                                Ngày làm việc
                              </FormLabel>
                              <Paper
                                variant="outlined"
                                sx={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  p: 1.5,
                                  gap: 1,
                                }}
                              >
                                {Object.entries(dayMapping).map(
                                  ([day, shortDay]) => (
                                    <Chip
                                      key={day}
                                      label={shortDay}
                                      onClick={() => toggleWorkDay(day)}
                                      color={
                                        data.workDays.includes(day)
                                          ? "primary"
                                          : "default"
                                      }
                                      sx={{
                                        transition: "all 0.2s",
                                        fontWeight: data.workDays.includes(day)
                                          ? "bold"
                                          : "normal",
                                      }}
                                    />
                                  )
                                )}
                              </Paper>
                              {errors.workDays && (
                                <FormHelperText>
                                  {errors.workDays}
                                </FormHelperText>
                              )}
                            </FormControl>
                          </Grid>
                        )}

                        {/* Work hours */}
                        {data.type === "fulltime" && (
                          <Grid
                            item
                            xs={12}
                            container
                            spacing={2}
                            component={motion.div}
                            variants={fadeIn}
                          >
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="Giờ bắt đầu"
                                type="time"
                                name="startTime"
                                value={data.startTime}
                                InputProps={{
                                  readOnly: true,
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <AccessTime />
                                    </InputAdornment>
                                  ),
                                }}
                                InputLabelProps={{ shrink: true }}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="Giờ kết thúc"
                                type="time"
                                name="endTime"
                                value={data.endTime}
                                InputProps={{
                                  readOnly: true,
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <AccessTime />
                                    </InputAdornment>
                                  ),
                                }}
                                InputLabelProps={{ shrink: true }}
                              />
                            </Grid>
                          </Grid>
                        )}

                        {/* Shifts for part-time */}
                        {data.type === "parttime" && (
                          <Grid
                            item
                            xs={12}
                            component={motion.div}
                            variants={fadeIn}
                          >
                            <FormControl
                              component="fieldset"
                              error={!!errors.shifts}
                            >
                              <FormLabel component="legend">
                                Ca làm việc
                              </FormLabel>
                              <RadioGroup
                                row
                                value={data.shifts[0] || ""}
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
                                    ...data,
                                    shifts: [shift],
                                    startTime,
                                    endTime,
                                  });

                                  // Clear shifts validation error
                                  if (errors.shifts) {
                                    setErrors((prev) => ({
                                      ...prev,
                                      shifts: "",
                                    }));
                                  }
                                }}
                              >
                                <FormControlLabel
                                  value="Morning"
                                  control={<Radio />}
                                  label="Sáng (08:00 - 11:00)"
                                />
                                <FormControlLabel
                                  value="Afternoon"
                                  control={<Radio />}
                                  label="Chiều (13:00 - 17:00)"
                                />
                                <FormControlLabel
                                  value="Evening"
                                  control={<Radio />}
                                  label="Tối (17:00 - 21:00)"
                                />
                              </RadioGroup>
                              {errors.shifts && (
                                <FormHelperText>{errors.shifts}</FormHelperText>
                              )}
                            </FormControl>
                          </Grid>
                        )}

                        {/* Submit Button */}
                        <Grid
                          item
                          xs={12}
                          component={motion.div}
                          variants={fadeIn}
                        >
                          <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            startIcon={<Save />}
                            sx={{
                              backgroundColor: "#48C1A6",
                              "&:hover": { backgroundColor: "#3aa18a" },
                              py: 1.5,
                              mt: 2,
                            }}
                          >
                            Tạo nhân viên
                          </Button>
                        </Grid>
                      </Grid>
                    </motion.div>
                  </form>
                </CardContent>
              </Grid>
            </Grid>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
}

export default CreateEmployee;
