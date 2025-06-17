// Nguyễn Huy Tâm - HE173108 5/2/2025
const db = require("../models/index");
// Tạo mới một sản phẩm
const createProduct = async (req, res, next) => {
  try {
    const {
      productName,
      categoryId,
      totalStock,
      thresholdStock,
      unit,
      location,
      status,
    } = req.body;

    // Ảnh sẽ được lấy từ req.file nếu có, nếu không thì dùng req.body.productImage
    const productImage = req.file ? `/uploads/${req.file.filename}` : req.body.productImage;

    // Kiểm tra các trường bắt buộc
    if (
      !productName ||
      !categoryId ||
      !productImage || // Vẫn kiểm tra productImage, nhưng giờ nó có thể đến từ req.file
      !unit ||
      !location
    ) {
      return res
        .status(400)
        .json({ message: "Thiếu thông tin sản phẩm bắt buộc" });
    }

    // Kiểm tra xem tên sản phẩm đã tồn tại trong cơ sở dữ liệu chưa
    const existingProduct = await db.Product.findOne({ productName });
    if (existingProduct) {
      return res.status(400).json({ message: "Sản phẩm đã tồn tại trong kho." });
    }

    // Kiểm tra danh mục
    const checkCategory = await db.Category.find({ _id: categoryId });
    if (!checkCategory || checkCategory.length === 0) {
      return res
        .status(404)
        .json({ message: "Định dạng danh mục sách nhà cung cấp không hợp lệ" });
    }

    // Tạo sản phẩm mới
    const newProduct = new db.Product({
      productName,
      categoryId,
      totalStock: totalStock || 0,
      thresholdStock: thresholdStock || 0,
      productImage, // Sử dụng productImage đã được xử lý từ req.file hoặc req.body
      unit,
      location,
      status: status || "active",
    });

    console.log("San pham moi la: ", newProduct);

    await newProduct.save();
    res
      .status(201)
      .json({ message: "Sản phẩm được tạo thành công", newProduct });
  } catch (err) {
    next(err);
  }
};

const getAllProducts = async (req, res) => {
  try {
    // Populate category data to include categoryName
    const products = await db.Product.find().populate('categoryId', 'categoryName status');

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Lấy một sản phẩm theo ID
const getProductById = async (req, res) => {
  try {
    const product = await db.Product.findById(req.params.id).populate("categoryId");
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tìm thấy" });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { productName, categoryId, thresholdStock, unit, location } = req.body;
    const productImage = req.file ? `/uploads/${req.file.filename}` : req.body.productImage;
    console.log("San pham la" + id)
    const existingProduct = await db.Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Khong tim thay san pham" });
    }

    const updatedProduct = { productName, categoryId, thresholdStock, unit, location };

    if (productImage) updatedProduct.productImage = productImage;

    const products = await db.Product.findByIdAndUpdate(id, { $set: updatedProduct }, { new: true });
    res.status(200).json({ message: "Cap nhat san pham thanh cong", products });
  } catch (error) {
    next(error);
  }
};


// // Xóa một sản phẩm theo ID
// async function inactiveProduct(req, res, next) {
//     try {
//         const { id } = req.params;
//         const { status } = req.body;
//         const changedProduct = await db.Product.findByIdAndUpdate(id, { status });
//         if (!changedProduct) {
//             return res.status(404).json({ message: "Sản phẩm không tìm thấy" });
//         }
//         res.status(200).json({ message: "Trạng thái sản phẩm đã được thay đổi thành công", changedProduct });
//     } catch (error) {
//         next(error);
//     }
// }
// Cập nhật trạng thái sản phẩm (inactive)
async function inactiveProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const changedProduct = await db.Product.findByIdAndUpdate(id, { status });
    if (!changedProduct) {
      return res.status(404).json({ message: "Sản phẩm không tìm thấy" });
    }
    res.status(200).json({ message: "Trạng thái sản phẩm đã được thay đổi thành công", changedProduct });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  inactiveProduct
};

// Cập nhật một sản phẩm theo ID cũ
// const updateProduct = async (req, res) => {
//   try {
//     let productData = req.body;

//     // Kiểm tra nếu có ảnh mới được tải lên
//     if (req.file) {
//       productData.productImage = req.file.path; // Cập nhật đường dẫn ảnh mới
//     }

//     const product = await db.Product.findByIdAndUpdate(req.params.id, productData, {
//       new: true,
//     });

//     if (!product) {
//       return res.status(404).json({ message: "Sản phẩm không tìm thấy" });
//     }
//     res.status(200).json(product);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };
