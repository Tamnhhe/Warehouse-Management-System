import { useState } from "react";
import productAPI from "../API/productAPI";

const useProduct = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [product, setProduct] = useState(null);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await productAPI.getAll();
            setProducts(response.data);
        } catch (err) {
            setError(err.message || "Failed to fetch products");
        } finally {
            setLoading(false);
        }
    };

    const fetchProductById = async (id) => {
        setLoading(true);
        try {
            const response = await productAPI.getById(id);
            setProduct(response.data);
        } catch (err) {
            setError(err.message || "Failed to fetch product");
        } finally {
            setLoading(false);
        }
    };

    const createProduct = async (formData) => {
        setLoading(true);
        try {
            const response = await productAPI.create(formData);
            setProducts([...products, response.data]);
        } catch (err) {
            setError(err.message || "Failed to create product");
        } finally {
            setLoading(false);
        }
    };

    const updateProduct = async (id, formData) => {
        setLoading(true);
        try {
            const response = await productAPI.update(id, formData);
            setProducts(products.map(p => (p._id === id ? response.data : p)));
        } catch (err) {
            setError(err.message || "Failed to update product");
        } finally {
            setLoading(false);
        }
    };

    const inactiveProduct = async (id) => {
        setLoading(true);
        try {
            await productAPI.inactivate(id);
            setProducts(products.map(p => (p._id === id ? { ...p, status: "inactive" } : p)));
        } catch (err) {
            setError(err.message || "Failed to inactivate product");
        } finally {
            setLoading(false);
        }
    };

    const checkProductName = async (name) => {
        try {
            const response = await productAPI.checkProductName(name);
            console.log(response);
            return response.data.exists; // Giả sử API trả về { exists: true/false }
        } catch (err) {
            setError(err.message || "Failed to check product name");
            return false;
        }
    };

    return {
        products,
        loading,
        error,
        product,
        fetchProducts,
        fetchProductById,
        createProduct,
        updateProduct,
        inactiveProduct,
        checkProductName,
    };
}

export default useProduct;