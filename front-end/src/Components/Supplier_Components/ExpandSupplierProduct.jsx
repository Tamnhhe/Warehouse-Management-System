import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  Card,
  Collapse,
  Button
} from "@mui/material";
import InventoryIcon from "@mui/icons-material/Inventory";

const ExpandSupplierProduct = ({
  open,
  supplier,
  supplierProducts,
  loadingProducts,
  palette
}) => {
  const productSample = {
    productName: "Sản phẩm mẫu",
    categoryName: "Danh mục mẫu",
    price: 100000,
    stock: 50,
    supplierProductId: "sample-id"
  };

  return (
    <Collapse in={open}>
      <Box sx={{ p: 2, backgroundColor: palette.light + "20" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" sx={{ color: palette.dark }}>
            <InventoryIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Sản phẩm của nhà cung cấp
            <Typography component="span" variant="body2" sx={{ ml: 1, color: "text.secondary" }}>
              (ID: {supplier._id})
            </Typography>
          </Typography>
          <Button
            variant="contained"
            size="small"
            sx={{ backgroundColor: palette.medium, color: palette.dark, fontWeight: "bold" }}
            onClick={() => alert("Chức năng thêm sản phẩm nhà cung cấp sẽ được phát triển!")}
          >
            Thêm sản phẩm nhà cung cấp
          </Button>
        </Box>
        {loadingProducts ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress size={24} sx={{ color: palette.dark }} />
          </Box>
        ) : supplierProducts.length > 0 ? (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Debug: Tìm thấy {supplierProducts.length} sản phẩm
            </Typography>
            <Grid container spacing={2}>
              {/* Sản phẩm mẫu */}
              <Grid item xs={12} sm={6} md={4} key={productSample.supplierProductId}>
                <Card
                  variant="outlined"
                  sx={{
                    p: 2,
                    height: "100%",
                    backgroundColor: palette.light + "10",
                    borderStyle: "dashed",
                    borderColor: palette.medium,
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: palette.medium }}>
                    {productSample.productName} (Sample)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {productSample.categoryName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: palette.medium, fontWeight: "medium" }}>
                    Giá: {new Intl.NumberFormat("vi-VN").format(productSample.price)} VNĐ
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tồn kho: {productSample.stock}
                  </Typography>
                </Card>
              </Grid>
              {/* Sản phẩm thực tế */}
              {supplierProducts.slice(0, 6).map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product.supplierProductId}>
                  <Card
                    variant="outlined"
                    sx={{
                      p: 2,
                      height: "100%",
                      "&:hover": {
                        boxShadow: 2,
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.2s",
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: palette.dark }}>
                      {product.productName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {product.categoryName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: palette.medium, fontWeight: "medium" }}>
                      Giá: {new Intl.NumberFormat("vi-VN").format(product.price)} VNĐ
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tồn kho: {product.stock}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
            Chưa có sản phẩm nào
          </Typography>
        )}
      </Box>
    </Collapse>
  );
};

export default ExpandSupplierProduct;
