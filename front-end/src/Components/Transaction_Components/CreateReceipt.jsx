import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Autocomplete,
  Grid,
  Breadcrumbs,
  Link as MuiLink,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// Import API modules
import supplierProductAPI from "../../API/supplierProductAPI";
import categoryAPI from "../../API/categoryAPI";
import supplierAPI from "../../API/supplierAPI";

// Bảng màu tham khảo
const palette = {
  dark: "#155E64",
  medium: "#75B39C",
};

const validationSchema = Yup.object({
  supplierName: Yup.string().required("Vui lòng chọn nhà cung cấp"),
  products: Yup.array()
    .of(
      Yup.object().shape({
        productName: Yup.string().required("Vui lòng chọn sản phẩm"),
        quantity: Yup.number()
          .required("Số lượng là bắt buộc")
          .min(1, "Số lượng phải lớn hơn 0"),
        price: Yup.number()
          .required("Đơn giá là bắt buộc")
          .min(0, "Đơn giá không được âm"),
      })
    )
    .min(1, "Phải có ít nhất một sản phẩm trong phiếu nhập"),
});

const CreateReceipt = () => {
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch dữ liệu cần thiết cho form bằng API modules
    const fetchInitialData = async () => {
      try {
        console.log("=== CreateReceipt fetchInitialData ===");
        const [categoriesRes, suppliersRes] = await Promise.all([
          categoryAPI.getAll(),
          supplierAPI.getAll(),
        ]);

        console.log("Categories response:", categoriesRes);
        console.log("Suppliers response:", suppliersRes);

        // Handle different response structures
        const categoriesData =
          categoriesRes.data?.data || categoriesRes.data || [];
        const suppliersData =
          suppliersRes.data?.data || suppliersRes.data || [];

        setCategories(categoriesData);
        setSuppliers(suppliersData.filter((s) => s.status === "active"));

        console.log("Categories set to:", categoriesData);
        console.log(
          "Suppliers set to:",
          suppliersData.filter((s) => s.status === "active")
        );
        console.log("=== End fetchInitialData ===");
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError(
          "Không thể tải dữ liệu cần thiết: " +
            (err.response?.data?.message || err.message)
        );
      }
    };
    fetchInitialData();
  }, []);

  const formik = useFormik({
    initialValues: {
      supplierName: "",
      transactionDate: new Date().toISOString().split("T")[0],
      products: [
        { productName: "", categoryName: "", quantity: "", price: "" },
      ],
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError("");
      setSuccess(false);
      // Payload được xây dựng lại để khớp với controller `createReceipt`
      const payload = {
        supplierName: values.supplierName,
        products: values.products.map((p) => ({
          productName: p.productName,
          categoryName: p.categoryName,
          quantity: p.quantity,
          price: p.price,
        })),
      };

      try {
        await axios.post(
          "http://localhost:9999/inventoryTransactions/create-receipts",
          payload
        );
        setSuccess(true);
        setTimeout(() => navigate("/receipts"), 2000);
      } catch (err) {
        setError(
          err.response?.data?.message || "Có lỗi xảy ra khi tạo phiếu nhập"
        );
      } finally {
        setLoading(false);
      }
    },
  });

  const handleSupplierChange = async (_, value) => {
    formik.setFieldValue("supplierName", value?.name || "");
    setSelectedSupplier(value);
    formik.setFieldValue("products", [
      { productName: "", categoryName: "", quantity: "", price: "" },
    ]);

    if (value) {
      try {
        console.log("=== CreateReceipt handleSupplierChange Debug ===");
        console.log("Selected supplier:", value);
        console.log("Supplier ID:", value._id);
        console.log("Supplier name:", value.name);
        console.log("Fetching products using supplierProductAPI...");

        // Use the standardized API
        const response = await supplierProductAPI.getProductsBySupplier(
          value._id
        );

        console.log("Full API Response:", response);
        console.log("Response status:", response.status);
        console.log("Response data:", response.data);
        console.log("Products array:", response.data?.data);
        console.log("Products count:", response.data?.data?.length || 0);
        console.log("API success flag:", response.data?.success);
        console.log("API total:", response.data?.total);

        // Backend trả về {success: true, data: [...], total: number}
        const products = response.data?.data || [];
        setFilteredProducts(products);

        console.log("Filtered products set to:", products);

        // Show alert if no products found
        if (products.length === 0) {
          alert(
            "Nhà cung cấp này chưa có sản phẩm nào. Vui lòng thêm sản phẩm trước khi tạo phiếu nhập."
          );
        }

        console.log("=== End handleSupplierChange Debug ===");
      } catch (error) {
        console.error("=== CreateReceipt handleSupplierChange Error ===");
        console.error("Error fetching products by supplier:", error);
        console.error("Error response:", error.response);
        console.error("Error status:", error.response?.status);
        console.error("Error data:", error.response?.data);
        console.error("=== End Error ===");

        setFilteredProducts([]);

        // Thông báo lỗi chi tiết cho user
        if (error.response?.status === 404) {
          alert(
            "Nhà cung cấp này chưa có sản phẩm nào. Vui lòng thêm sản phẩm cho nhà cung cấp trước."
          );
        } else if (error.response?.status === 500) {
          alert("Lỗi server khi tải danh sách sản phẩm. Vui lòng thử lại sau.");
        } else {
          alert(
            "Không thể tải danh sách sản phẩm: " +
              (error.response?.data?.message || error.message)
          );
        }
      }
    } else {
      setFilteredProducts([]);
    }
  };

  const handleProductSelect = (index, value) => {
    if (value) {
      formik.setFieldValue(`products.${index}.productName`, value.productName);
      formik.setFieldValue(
        `products.${index}.categoryName`,
        value.categoryId?.categoryName || ""
      );
    }
  };

  const addProductRow = () =>
    formik.setFieldValue("products", [
      ...formik.values.products,
      { productName: "", categoryName: "", quantity: "", price: "" },
    ]);
  const removeProductRow = (index) =>
    formik.setFieldValue(
      "products",
      formik.values.products.filter((_, i) => i !== index)
    );

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <form onSubmit={formik.handleSubmit}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Breadcrumbs aria-label="breadcrumb">
            <MuiLink
              component="button"
              variant="body2"
              onClick={() => navigate("/receipts")}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <ArrowBackIcon sx={{ mr: 0.5, fontSize: "inherit" }} /> Trở về
              danh sách
            </MuiLink>
            <Typography color="text.primary">Tạo phiếu nhập mới</Typography>
          </Breadcrumbs>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ bgcolor: palette.dark, "&:hover": { bgcolor: "#104c50" } }}
          >
            {loading ? "Đang lưu..." : "Lưu và tạo mới"}
          </Button>
        </Box>

        <Paper elevation={2} sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={suppliers}
                getOptionLabel={(option) => option.name}
                value={selectedSupplier}
                onChange={handleSupplierChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Chọn nhà cung cấp"
                    error={
                      formik.touched.supplierName &&
                      Boolean(formik.errors.supplierName)
                    }
                    helperText={
                      formik.touched.supplierName && formik.errors.supplierName
                    }
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ngày nhập"
                type="date"
                name="transactionDate"
                value={formik.values.transactionDate}
                onChange={formik.handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: "bold" }}>
            Chi tiết sản phẩm
          </Typography>

          {/* Thông báo khi supplier chưa có sản phẩm */}
          {selectedSupplier && filteredProducts.length === 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Nhà cung cấp "{selectedSupplier.name}" chưa có sản phẩm nào. Vui
              lòng thêm sản phẩm cho nhà cung cấp này trước khi tạo phiếu nhập.
            </Alert>
          )}

          {!selectedSupplier && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Vui lòng chọn nhà cung cấp để xem danh sách sản phẩm có thể nhập.
            </Alert>
          )}

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sản phẩm</TableCell>
                  <TableCell>Số lượng</TableCell>
                  <TableCell>Đơn giá (VNĐ)</TableCell>
                  <TableCell>Thành tiền (VNĐ)</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formik.values.products.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ width: "40%" }}>
                      <Autocomplete
                        options={filteredProducts}
                        getOptionLabel={(option) => option.productName || ""}
                        value={
                          filteredProducts.find(
                            (p) => p.productName === product.productName
                          ) || null
                        }
                        onChange={(_, value) =>
                          handleProductSelect(index, value)
                        }
                        disabled={!selectedSupplier}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Tìm sản phẩm"
                            variant="standard"
                            error={
                              formik.touched.products?.[index]?.productName &&
                              Boolean(
                                formik.errors.products?.[index]?.productName
                              )
                            }
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        variant="standard"
                        value={product.quantity}
                        onChange={(e) =>
                          formik.setFieldValue(
                            `products.${index}.quantity`,
                            e.target.value
                          )
                        }
                        error={
                          formik.touched.products?.[index]?.quantity &&
                          Boolean(formik.errors.products?.[index]?.quantity)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        variant="standard"
                        value={product.price}
                        onChange={(e) =>
                          formik.setFieldValue(
                            `products.${index}.price`,
                            e.target.value
                          )
                        }
                        error={
                          formik.touched.products?.[index]?.price &&
                          Boolean(formik.errors.products?.[index]?.price)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {(product.quantity * product.price || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => removeProductRow(index)}
                        disabled={formik.values.products.length === 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Button
            startIcon={<AddIcon />}
            onClick={addProductRow}
            disabled={!selectedSupplier}
            sx={{ mt: 2, color: palette.dark }}
          >
            Thêm sản phẩm
          </Button>
          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mt: 3 }}>
              Phiếu nhập đã được tạo thành công! Đang chuyển hướng...
            </Alert>
          )}
        </Paper>
      </form>
    </Container>
  );
};

export default CreateReceipt;
