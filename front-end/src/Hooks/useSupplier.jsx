import { useState } from "react";
import supplierAPI from "../API/supplierAPI";

const useSupplier = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [supplier, setSupplier] = useState(null);

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const response = await supplierAPI.getAll();
            setSuppliers(response.data);
        } catch (err) {
            setError(err.message || "Failed to fetch suppliers");
        } finally {
            setLoading(false);
        }
    };

    const fetchSupplierById = async (id) => {
        setLoading(true);
        try {
            const response = await supplierAPI.getList(id);
            setSupplier(response.data);
        } catch (err) {
            setError(err.message || "Failed to fetch supplier");
        } finally {
            setLoading(false);
        }
    };
    const createSupplier = async (formData) => {
        setLoading(true);
        try {
            const response = await supplierAPI.add(formData);
            setSuppliers([...suppliers, response.data]);
        } catch (err) {
            setError(err.message || "Failed to create supplier");
        } finally {
            setLoading(false);
        }
    };

    const updateSupplier = async (id, formData) => {
        setLoading(true);
        try {
            const response = await supplierAPI.update(id, formData);
            setSuppliers(suppliers.map(s => (s._id === id ? response.data : s)));
        } catch (err) {
            setError(err.message || "Failed to update supplier");
        } finally {
            setLoading(false);
        }
    };

    const updateSupplierStatus = async (id, status) => {
        setLoading(true);
        try {
            const response = await supplierAPI.updateStatus(id, { status });
            setSuppliers(suppliers.map(s => (s._id === id ? response.data : s)));
        } catch (err) {
            setError(err.message || "Failed to update supplier status");
        } finally {
            setLoading(false);
        }
    };

    return { suppliers, loading, error, supplier, fetchSuppliers, fetchSupplierById, createSupplier, updateSupplier, updateSupplierStatus };
}

export default useSupplier;
