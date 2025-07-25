import { useState } from 'react';
import categoryAPI from '../API/categoryAPI';

const useCategory = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [category, setCategory] = useState(null);
    const [fullcategories, setFullCategories] = useState([]);
    const getAllCategories = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await categoryAPI.getAll();
            const data = res.data?.data || res.data || [];
            const filteredActiveCategories = data.filter(cat => cat.status === 'active');
            setCategories(filteredActiveCategories);
            setFullCategories(data);
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
            // Update the local state to include the new category
            setCategories(prev => [...prev, res.data.newCategory]);
            setFullCategories(prev => [...prev, res.data.newCategory]);
            setLoading(false);
            return res;
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Create category failed');
            setLoading(false);
            throw err; // Re-throw to handle in the component if needed
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
            throw err; // Re-throw to handle in the component if needed
        }
    };

    const inactivateCategory = async (id, data) => {
        setLoading(true);
        setError(null);
        try {
            const res = await categoryAPI.inactivate(id, { status: data.status });
            setCategories(prev => prev.map(cat => cat._id === id ? { ...cat, status: data.status } : cat));
            setFullCategories(prev => prev.map(cat => cat._id === id ? { ...cat, status: data.status } : cat));
            setLoading(false);
            return res;
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Delete category failed');
            setLoading(false);
            return null;
        }
    };

    const addSubcategory = async (categoryId, data) => {
        setLoading(true);
        setError(null);
        try {
            const res = await categoryAPI.addSub(categoryId, data);
            // Update the local state to include the new subcategory
            setLoading(false);
            return res;
        }
        catch (err) {
            setError(err.response?.data?.message || err.message || 'Add subcategory failed');
            setLoading(false);
            throw err; // Re-throw to handle in the component if needed
        }
    }
    const updateSubcategory = async (categoryId, subId, data) => {
        setLoading(true);
        setError(null);
        try {
            const res = await categoryAPI.updateSub(categoryId, subId, data);
            // Update the local state to reflect the change
            
            setLoading(false);
            return res;
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Update subcategory failed');
            setLoading(false);
            return null;
        }
    };
    const deleteSubcategory = async (categoryId, subId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await categoryAPI.deleteSub(categoryId, subId);
            // Update the local state to remove the deleted subcategory
            
            setLoading(false);
            return res;
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Delete subcategory failed');
            setLoading(false);
            return null;
        }
    };

    return { loading, error, categories, category, fullcategories, getAllCategories, getCategoryById, createCategory, updateCategory, inactivateCategory, addSubcategory, updateSubcategory, deleteSubcategory };
}
export default useCategory;