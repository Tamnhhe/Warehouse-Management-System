import { useState } from 'react';
import transactionAPI from '../API/transactionAPI';

const useTransaction = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [transaction, setTransaction] = useState(null);
    const [total, setTotal] = useState(0);
    const [count, setCount] = useState(0);

    const getAllTransactions = async (params) => {
        setLoading(true);
        setError(null);
        try {
            const res = await transactionAPI.getAllTransactions(params);
            setTransactions(res.data || res);
            setTotal(res.total || 0);
            setCount(res.count || 0);
            setLoading(false);
            return res;
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Get transactions failed');
            setLoading(false);
            return null;
        }
    }

    const getTransactionById = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const res = await transactionAPI.getTransactionById(id);
            setTransaction(res.data || res);
            setLoading(false);
            return res;
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Get transaction failed');
            setLoading(false);
            return null;
        }
    };

    const createTransaction = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const res = await transactionAPI.createTransaction(data);
            setLoading(false);
            return res;
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Create transaction failed');
            setLoading(false);
            return null;
        }
    };

    const updateTransaction = async (id, data) => {
        setLoading(true);
        setError(null);
        try {
            const res = await transactionAPI.updateTransaction(id, data);
            setLoading(false);
            return res;
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Update transaction failed');
            setLoading(false);
            return null;
        }
    };

    const updateTransactionStatus = async (id, data) => {
        setLoading(true);
        setError(null);
        try {
            const res = await transactionAPI.updateTransactionStatus(id, data);
            setLoading(false);
            return res;
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Update transaction status failed');
            setLoading(false);
            return null;
        }
    };

    const createReceipt = async (formData) => {
        setLoading(true);
        setError(null);
        try {
            const res = await transactionAPI.createReceipt(formData);
            setLoading(false);
            return res;
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Create receipt failed');
            setLoading(false);
            return null;
        }
    };
    return {
        loading,
        error,
        transactions,
        transaction,
        total,
        count,
        getAllTransactions,
        getTransactionById,
        createTransaction,
        updateTransaction,
        updateTransactionStatus,
        createReceipt
    };
};
export default useTransaction;