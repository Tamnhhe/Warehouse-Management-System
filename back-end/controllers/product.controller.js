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
      netWeight, // THÊM netWeight VÀO ĐÂY
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
      !productImage ||
      !unit ||
      !location ||
      netWeight === undefined || netWeight === null || netWeight === "" 
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

    // Validate netWeight là số và có giá trị hợp lệ
    const parsedNetWeight = Number(netWeight);
    if (isNaN(parsedNetWeight) || parsedNetWeight < 100) {
      return res.status(400).json({ message: "Khối lượng tịnh phải là số và tối thiểu 100 gram." });
    }

    // Tạo sản phẩm mới
    const newProduct = new db.Product({
      productName,
      categoryId,
      totalStock: totalStock || 0, // totalStock có thể không có khi tạo mới, mặc định là 0
      thresholdStock: thresholdStock ||0, // SỬ DỤNG GIÁ TRỊ ĐÃ PARSE
      netWeight: parsedNetWeight, // THÊM netWeight VÀ SỬ DỤNG GIÁ TRỊ ĐÃ PARSE
      productImage,
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
    const { productName, categoryId, thresholdStock, netWeight, unit, location } = req.body; // THÊM netWeight VÀO ĐÂY
    const productImage = req.file ? `/uploads/${req.file.filename}` : req.body.productImage;
    console.log("San pham la" + id)
    const existingProduct = await db.Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Khong tim thay san pham" });
    }

    // Validate netWeight và thresholdStock nếu chúng được cung cấp
    const updatedFields = {};

    if (productName !== undefined) updatedFields.productName = productName;
    if (categoryId !== undefined) updatedFields.categoryId = categoryId;

    if (netWeight !== undefined && netWeight !== null && netWeight !== "") {
      const parsedNetWeight = Number(netWeight);
      if (isNaN(parsedNetWeight) || parsedNetWeight < 100) {
        return res.status(400).json({ message: "Khối lượng tịnh phải là số và tối thiểu 100 gram." });
      }
      updatedFields.netWeight = parsedNetWeight;
    } else if (netWeight === "") { // Nếu gửi lên chuỗi rỗng (người dùng xóa input)
      updatedFields.netWeight = 0; // Hoặc một giá trị mặc định khác tùy business logic
    }

    if (thresholdStock !== undefined && thresholdStock !== null && thresholdStock !== "") {
      const parsedThresholdStock = Number(thresholdStock);
      if (isNaN(parsedThresholdStock) || parsedThresholdStock < 0) {
        return res.status(400).json({ message: "Ngưỡng tồn kho phải là số và không thể âm." });
      }
      updatedFields.thresholdStock = parsedThresholdStock;
    } else if (thresholdStock === "") { // Nếu gửi lên chuỗi rỗng
      updatedFields.thresholdStock = 0; // Hoặc giá trị mặc định
    }

    if (unit !== undefined) updatedFields.unit = unit;
    if (location !== undefined) updatedFields.location = location;

    if (productImage) updatedFields.productImage = productImage;


    const products = await db.Product.findByIdAndUpdate(id, { $set: updatedFields }, { new: true });
    res.status(200).json({ message: "Cap nhat san pham thanh cong", products });
  } catch (error) {
    next(error);
  }
};


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