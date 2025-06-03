
const db = require("../models/index");
const mongoose = require("mongoose");

// Lấy danh sách tất cả các category
async function getCategories(req, res, next) {
    try {
        const categories = await db.Category.find({});
        res.status(200).json(categories);
    } catch (error) {
        next(error);
    }
}

// Thêm category
async function addCategory(req, res, next) {
    try {
        const { categoryName, description, classifications } = req.body;

        const formattedClassifications = classifications.map(sub => ({
            _id: sub._id ? sub._id : new mongoose.Types.ObjectId(),
            name: sub.name,
            description: sub.description || "",
        }));

        const newCategory = new db.Category({
            categoryName,
            description,
            classifications: formattedClassifications,
        });

        await newCategory.save();
        res.status(201).json({ message: "Danh mục thêm mới thành công", newCategory });
    } catch (error) {
        next(error);
    }
}
// Sửa category
async function updateCategory(req, res, next) {
    try {
        const { id } = req.params;
        const { categoryName, description, status } = req.body;
        const updatedCategory = await db.Category.findByIdAndUpdate(
            id,
            { categoryName, description, status },
            { new: true }
        );
        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json({ message: "Category updated successfully", updatedCategory });
    } catch (error) {
        next(error);
    }
}

// // Thay đổi trạng thái category
// async function inactiveCategory(req, res, next) {
//     try {
//         const { id } = req.params;
//         const { status } = req.body;
//         const changedCategory = await db.Category.findByIdAndUpdate(id, { status });
//         if (!changedCategory) {
//             return res.status(404).json({ message: "Category not found" });
//         }
//         res.status(200).json({ message: "Category status changed successfully", changedCategory });
//     } catch (error) {
//         next(error);
//     }
// }

// Thay đổi trạng thái category và cập nhật trạng thái sản phẩm liên quan
async function inactiveCategory(req, res, next) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Cập nhật trạng thái của category
        const changedCategory = await db.Category.findByIdAndUpdate(id, { status });
        if (!changedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Nếu trạng thái của category là "inactive", cập nhật tất cả sản phẩm thuộc category này
        if (status === "inactive") {
            await db.Product.updateMany(
                { categoryId: id },
                { $set: { status: "inactive" } }
            );
        }

        res.status(200).json({ message: "Category status changed successfully", changedCategory });
    } catch (error) {
        next(error);
    }
}

// Thêm sub category
async function addSubCategory(req, res, next) {
    try {
        const { categoryId } = req.params;
        const { name, description } = req.body;
        const category = await db.Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        const newSubCategory = {
            _id: new mongoose.Types.ObjectId(),
            name,
            description,
        };
        category.classifications.push(newSubCategory);
        await category.save();
        res.status(201).json({ message: "Subcategory added successfully", newSubCategory });
    } catch (error) {
        next(error);
    }
}

// Sửa sub category 
async function updateSubCategory(req, res, next) {
    try {
        const { categoryId, subCategoryId } = req.params;
        const { name, description } = req.body;
        const category = await db.Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        const subCategory = category.classifications.id(subCategoryId);
        if (!subCategory) {
            return res.status(404).json({ message: "Subcategory not found" });
        }
        subCategory.name = name || subCategory.name;
        subCategory.description = description || subCategory.description;
        await category.save();
        res.status(200).json({ message: "Subcategory updated successfully", subCategory });
    } catch (error) {
        next(error);
    }
}

// Xóa sub category 
async function deleteSubCategory(req, res) {
    try {
        const { categoryId, subId } = req.params;
        const category = await db.Category.findById(categoryId);

        if (!category) return res.status(404).json({ message: "Category not found" });

        for (let i = 0; i < category.classifications.length; i++) {
            if (category.classifications[i]._id.toString() == subId.toString()) {
                category.classifications.splice(i, 1);
                await category.save();
                return res.status(200).json({ message: "Subcategory deleted successfully", category });
            }
        }

        return res.status(404).json({ message: "Subcategory not found" });
    } catch (error) {
        next(error);
    }
}
const categoryController = {
    getCategories,
    addCategory,
    updateCategory,
    inactiveCategory,
    addSubCategory,
    updateSubCategory,
    deleteSubCategory,
};

module.exports = categoryController;
