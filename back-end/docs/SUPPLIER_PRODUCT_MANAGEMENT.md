# Hướng dẫn API quản lý sản phẩm trong màn hình nhà cung cấp

## Mô tả chung

Thay vì tạo một màn hình riêng biệt cho quản lý SupplierProduct, các API này được thiết kế để tích hợp quản lý sản phẩm trực tiếp vào màn hình quản lý nhà cung cấp.

## API Endpoints

### 1. Lấy thông tin chi tiết nhà cung cấp kèm danh sách sản phẩm

```
GET /api/suppliers/getSupplierWithProducts/:id?includeInactive=false
```

**Mô tả**: Lấy thông tin chi tiết nhà cung cấp kèm theo danh sách sản phẩm và thống kê.

**Parameters**:

- `id`: ID của nhà cung cấp
- `includeInactive`: (optional) true/false - có lấy cả sản phẩm inactive không

**Response**:

```json
{
  "supplier": {
    "_id": "supplier_id",
    "name": "Tên nhà cung cấp",
    "contact": "0123456789",
    "email": "email@example.com",
    "status": "active",
    "address": "Địa chỉ",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "products": [
    {
      "supplierProductId": "supplier_product_id",
      "productId": "product_id",
      "productName": "Tên sản phẩm",
      "productDescription": "Mô tả sản phẩm",
      "price": 50000,
      "stock": 100,
      "expiry": "2024-12-31T00:00:00.000Z",
      "categoryId": "category_id",
      "categoryName": "Tên danh mục",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "stats": {
    "totalProducts": 10,
    "totalStock": 1000,
    "avgPrice": 45000,
    "totalValue": 4500000
  }
}
```

### 2. Lấy danh sách sản phẩm của nhà cung cấp

```
GET /api/supplier-products/supplier/:supplierId/products?includeAll=false
```

**Mô tả**: Lấy danh sách sản phẩm chi tiết của một nhà cung cấp.

**Parameters**:

- `supplierId`: ID của nhà cung cấp
- `includeAll`: (optional) true/false - có lấy cả sản phẩm inactive không

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "supplierProductId": "supplier_product_id",
      "productId": "product_id",
      "productName": "Tên sản phẩm",
      "productDescription": "Mô tả sản phẩm",
      "price": 50000,
      "stock": 100,
      "expiry": "2024-12-31T00:00:00.000Z",
      "categoryId": "category_id",
      "categoryName": "Tên danh mục",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 10
}
```

### 3. Lấy danh sách sản phẩm có thể thêm vào nhà cung cấp

```
GET /api/supplier-products/supplier/:supplierId/available-products?search=keyword
```

**Mô tả**: Lấy danh sách các sản phẩm chưa có quan hệ với nhà cung cấp này, có thể thêm vào.

**Parameters**:

- `supplierId`: ID của nhà cung cấp
- `search`: (optional) Từ khóa tìm kiếm tên sản phẩm

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "productId": "product_id",
      "productName": "Tên sản phẩm",
      "description": "Mô tả sản phẩm",
      "categoryId": "category_id",
      "categoryName": "Tên danh mục"
    }
  ],
  "total": 5
}
```

### 4. Thêm sản phẩm vào nhà cung cấp

```
POST /api/supplier-products/supplier/:supplierId/add-product
```

**Body**:

```json
{
  "productId": "product_id",
  "price": 50000,
  "stock": 100,
  "expiry": "2024-12-31T00:00:00.000Z"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Thêm sản phẩm vào nhà cung cấp thành công",
  "data": {
    "supplierProductId": "new_supplier_product_id",
    "productId": "product_id",
    "productName": "Tên sản phẩm",
    "productDescription": "Mô tả sản phẩm",
    "price": 50000,
    "stock": 100,
    "expiry": "2024-12-31T00:00:00.000Z",
    "categoryId": "category_id",
    "categoryName": "Tên danh mục",
    "status": "active"
  }
}
```

### 5. Cập nhật thông tin sản phẩm của nhà cung cấp

```
PUT /api/supplier-products/supplier-product/:supplierProductId
```

**Body**:

```json
{
  "price": 55000,
  "stock": 150,
  "expiry": "2024-12-31T00:00:00.000Z"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Cập nhật thông tin sản phẩm thành công",
  "data": {
    "supplierProductId": "supplier_product_id",
    "productId": "product_id",
    "productName": "Tên sản phẩm",
    "productDescription": "Mô tả sản phẩm",
    "price": 55000,
    "stock": 150,
    "expiry": "2024-12-31T00:00:00.000Z",
    "categoryId": "category_id",
    "categoryName": "Tên danh mục",
    "status": "active"
  }
}
```

### 6. Xóa sản phẩm khỏi nhà cung cấp

```
DELETE /api/supplier-products/supplier-product/:supplierProductId
```

**Response**:

```json
{
  "success": true,
  "message": "Đã xóa sản phẩm \"Tên sản phẩm\" khỏi nhà cung cấp \"Tên nhà cung cấp\""
}
```

### 7. Lấy thống kê sản phẩm của nhà cung cấp

```
GET /api/supplier-products/supplier/:supplierId/stats
```

**Response**:

```json
{
  "success": true,
  "data": {
    "totalProducts": 15,
    "activeProducts": 12,
    "inactiveProducts": 3,
    "totalStock": 1500,
    "avgPrice": 45000,
    "minPrice": 10000,
    "maxPrice": 100000
  }
}
```

## Workflow đề xuất cho Frontend

### 1. Màn hình danh sách nhà cung cấp

- Hiển thị danh sách nhà cung cấp với số lượng sản phẩm của mỗi nhà cung cấp
- Có nút "Xem chi tiết" hoặc "Quản lý sản phẩm" cho mỗi nhà cung cấp

### 2. Màn hình chi tiết nhà cung cấp

- Hiển thị thông tin nhà cung cấp ở phần trên
- Hiển thị thống kê tổng quan về sản phẩm
- Hiển thị danh sách sản phẩm của nhà cung cấp trong bảng với các cột:
  - Tên sản phẩm
  - Danh mục
  - Giá
  - Tồn kho
  - Hạn sử dụng
  - Trạng thái
  - Hành động (Sửa, Xóa)

### 3. Chức năng thêm sản phẩm

- Có nút "Thêm sản phẩm" ở đầu danh sách
- Click vào sẽ mở modal/popup hiển thị danh sách sản phẩm có thể thêm
- Có tìm kiếm để lọc sản phẩm
- Chọn sản phẩm và nhập giá, tồn kho, hạn sử dụng

### 4. Chức năng sửa thông tin sản phẩm

- Click "Sửa" ở hàng sản phẩm sẽ mở form/modal
- Chỉ cho phép sửa giá, tồn kho, hạn sử dụng
- Không cho phép đổi sản phẩm (phải xóa và thêm mới)

### 5. Chức năng xóa sản phẩm

- Click "Xóa" sẽ hiện confirm dialog
- Xóa thành công sẽ refresh danh sách

## Lợi ích của cách tiếp cận này

1. **Tích hợp tốt hơn**: Người dùng không cần chuyển qua lại giữa nhiều màn hình
2. **UX/UI tốt hơn**: Tất cả thông tin liên quan đến nhà cung cấp ở một nơi
3. **Hiệu quả hơn**: Ít click chuột hơn, workflow mượt mà hơn
4. **Dễ quản lý**: Nhìn thấy tổng quan về nhà cung cấp và sản phẩm của họ
5. **Tương thích ngược**: Vẫn giữ các API cũ để không ảnh hưởng đến code hiện tại

## Ghi chú

- Tất cả các API mới đều có prefix `/api/supplier-products/supplier/` để dễ phân biệt
- Các API cũ vẫn được giữ để tương thích ngược
- Response format đã được chuẩn hóa với `success` flag và `data` object
- Có validation đầy đủ cho tất cả input
- Error handling được cải thiện với message tiếng Việt rõ ràng
