import { useState } from 'react';
import categoryAPI from '../API/categoryAPI';

const useCategory = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [category, setCategory] = useState(null);

    const getAllCategories = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await categoryAPI.getAll();
            setCategories(res.data || res);
            setLoading(false);
            return res;
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Get categories failed');
            setLoading(false);
            return null;
        }
    };

    const getCategoryById = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const res = await categoryAPI.get(id);
            setCategory(res.data || res);
            setLoading(false);
            return res;
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Get category failed');
            setLoading(false);
            return null;
        }
    };

    // Optional: You can add more functions like createCategory, updateCategory, deleteCategory here
    const createCategory = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const res = await categoryAPI.add(data);
            setCategories(prev => [...prev, res.data || res]); // Update local state with new category
            setLoading(false);
            return res;
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Create category failed');
            setLoading(false);
            return null;
        }
    };

    const updateCategory = async (id, data) => {
        setLoading(true);
        setError(null);
        try {
            const res = await categoryAPI.update(id, data);
            setLoading(false);
            return res;
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Update category failed');
            setLoading(false);
            return null;
        }
    };

    const deleteCategory = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const res = await categoryAPI.inactivate(id);
            setLoading(false);
            return res;
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Delete category failed');
            setLoading(false);
            return null;
        }
    };

    return { loading, error, categories, category, getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
}
export default useCategory;