// Nguyễn Huy Tâm - HE173108 5/2/2025
const db = require("../models/index");
const Product = require('../models/product.model');
const Category = require('../models/category.model');

// Tạo mới một sản phẩm
const createProduct = async (req, res, next) => {
  try {
    const {
      productName,
      categoryId,
      totalStock,
      thresholdStock,
<<<<<<< HEAD
      netWeight, // THÊM netWeight VÀO ĐÂY
=======
      productImage,
>>>>>>> origin/inter3
      unit,
      location,
      quantitative,
      status
    } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : productImage;

    // Kiểm tra các trường bắt buộc
<<<<<<< HEAD
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
=======
    if (!productName || !categoryId || !image || !unit || !location || typeof thresholdStock !== 'number') {
      return res.status(400).json({ message: 'Thiếu thông tin sản phẩm bắt buộc' });
>>>>>>> origin/inter3
    }


    // Kiểm tra danh mục
    const checkCategory = await Category.findById(categoryId);
    if (!checkCategory) {
      return res.status(404).json({ message: 'Danh mục không hợp lệ' });
    }

<<<<<<< HEAD
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
=======
    // Kiểm tra mảng vị trí
    if (!Array.isArray(location) || location.length === 0) {
      return res.status(400).json({ message: 'Location phải là một mảng và không được rỗng' });
    }
    for (const loc of location) {
      if (!loc.inventoryId || typeof loc.stock !== 'number') {
        return res.status(400).json({ message: 'Mỗi vị trí phải có inventoryId và stock là số' });
      }
    }
    // Kiểm tra xem tên sản phẩm đã tồn tại trong cơ sở dữ liệu chưa
    const existingProduct = await Product.findOne({ productName });
    if (existingProduct) {
      return res.status(400).json({ message: 'Sản phẩm đã tồn tại trong kho.' });
    }
    const newProduct = new Product({
      productName,
      categoryId,
      totalStock: typeof totalStock === 'number' ? totalStock : 0,
      thresholdStock,
      productImage: image,
>>>>>>> origin/inter3
      unit,
      location: location ? location.map(loc => ({ inventoryId: loc.inventoryId, stock: loc.stock })) : [],
      quantitative: typeof quantitative === 'number' ? quantitative : 1,
      status: status || 'active',
    });
    await newProduct.save();
    res.status(201).json({ message: 'Sản phẩm được tạo thành công', newProduct });
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
    const product = await Product.findById(req.params.id).populate('categoryId', 'categoryName status');
    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tìm thấy' });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
<<<<<<< HEAD

async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { productName, categoryId, thresholdStock, netWeight, unit, location } = req.body; // THÊM netWeight VÀO ĐÂY
    const productImage = req.file ? `/uploads/${req.file.filename}` : req.body.productImage;
    console.log("San pham la" + id)
    const existingProduct = await db.Product.findById(id);
=======
// Cập nhật một sản phẩm theo ID
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      productName,
      categoryId,
      totalStock,
      thresholdStock,
      productImage,
      unit,
      location,
      quantitative,
      status
    } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : productImage;
    const existingProduct = await Product.findById(id);
>>>>>>> origin/inter3
    if (!existingProduct) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
<<<<<<< HEAD

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
=======
    const updateFields = {};
    if (productName) updateFields.productName = productName;
    if (categoryId) updateFields.categoryId = categoryId;
    if (typeof totalStock === 'number') updateFields.totalStock = totalStock;
    if (typeof thresholdStock === 'number') updateFields.thresholdStock = thresholdStock;
    if (image) updateFields.productImage = image;
    if (unit) updateFields.unit = unit;
    if (Array.isArray(location)) updateFields.location = location;
    if (typeof quantitative === 'number') updateFields.quantitative = quantitative;
    if (status) updateFields.status = status;
    const updatedProduct = await Product.findByIdAndUpdate(id, { $set: updateFields }, { new: true });
    res.status(200).json({ message: 'Cập nhật sản phẩm thành công', updatedProduct });
>>>>>>> origin/inter3
  } catch (error) {
    next(error);
  }
};
<<<<<<< HEAD


=======
>>>>>>> origin/inter3
// Cập nhật trạng thái sản phẩm (inactive)
const inactiveProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const changedProduct = await Product.findByIdAndUpdate(id, { status }, { new: true });
    if (!changedProduct) {
      return res.status(404).json({ message: 'Sản phẩm không tìm thấy' });
    }
    res.status(200).json({ message: 'Trạng thái sản phẩm đã được thay đổi thành công', changedProduct });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  inactiveProduct
<<<<<<< HEAD
};
=======
};
>>>>>>> origin/inter3
