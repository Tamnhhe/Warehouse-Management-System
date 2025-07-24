import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
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
import useSupplier from "../../Hooks/useSupplier";
import useSupplierProduct from "../../Hooks/useSupplierProduct";
import useCategory from "../../Hooks/useCategory";
import authorApi from "../../API/baseAPI/authorAPI"; // Thêm import này

const palette = {
  dark: "#155E64",
  medium: "#75B39C",
};

// Xóa trường weight khỏi validation
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
          .min(0.01, "Giá nhập phải lớn hơn 0"),
        // Bỏ weight
      })
    )
    .min(1, "Phải có ít nhất một sản phẩm trong phiếu nhập"),
});

const CreateReceipt = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const navigate = useNavigate();

  // Use hooks
  const { suppliers, fetchSuppliers } = useSupplier();
  const { fetchProductsBySupplier } = useSupplierProduct();
  const { categories, getAllCategories } = useCategory();

  useEffect(() => {
    fetchSuppliers();
    getAllCategories();
  }, []);

  const formik = useFormik({
    initialValues: {
      supplierName: "",
      transactionDate: new Date().toISOString().split("T")[0],
      products: [
        { productName: "", categoryName: "", quantity: "", price: "" }, // Bỏ weight
      ],
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError("");
      setSuccess(false);
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
        // Sử dụng authorApi thay vì fetch trực tiếp
        await authorApi.post("/inventoryTransactions/create-receipts", payload);
        setSuccess(true);
        setTimeout(() => navigate("/receipts"), 2000);
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "Có lỗi xảy ra khi tạo phiếu nhập"
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
        const products = await fetchProductsBySupplier(value._id);
        setFilteredProducts(products);
      } catch (error) {
        setFilteredProducts([]);
      }
    } else {
      setFilteredProducts([]);
    }
  };

  // Khi chọn sản phẩm, tự động điền danh mục (không điền weight nữa)
  const handleProductSelect = (index, value) => {
    if (value) {
      formik.setFieldValue(`products.${index}.productName`, value.productName);
      formik.setFieldValue(
        `products.${index}.categoryName`,
        value.categoryId?.categoryName || ""
      );
      // Không set weight
    }
  };

  const addProductRow = () =>
    formik.setFieldValue("products", [
      ...formik.values.products,
      { productName: "", categoryName: "", quantity: "", price: "" }, // Bỏ weight
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
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sản phẩm</TableCell>
                  <TableCell>Số lượng</TableCell>
                  {/* <TableCell>Cân nặng</TableCell> */}
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
                    {/* Bỏ cột cân nặng */}
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
                        inputProps={{
                          min: "0.01",
                          step: "0.01"
                        }}
                        error={
                          formik.touched.products?.[index]?.price &&
                          Boolean(formik.errors.products?.[index]?.price)
                        }
                        helperText={
                          formik.touched.products?.[index]?.price &&
                          formik.errors.products?.[index]?.price
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