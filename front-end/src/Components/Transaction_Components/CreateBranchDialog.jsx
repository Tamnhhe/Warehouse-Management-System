import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Alert,
} from "@mui/material";
import axios from "axios";

const CreateBranchDialog = ({ open, onClose, onSuccess }) => {
    const [form, setForm] = useState({
        name: "",
        receiver: "",
        address: "",
        phone: "",
        email: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await axios.post(
                "http://localhost:9999/branches/createBranch",
                form
            );
            if (res.data.success) {
                onSuccess(res.data.data);
                onClose();
                setForm({ name: "", receiver: "", address: "", phone: "", email: "" });
            } else {
                setError(res.data.message || "Tạo chi nhánh thất bại");
            }
        } catch (err) {
            setError(
                err.response?.data?.message || "Lỗi khi tạo chi nhánh, vui lòng thử lại."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Tạo chi nhánh mới</DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    <TextField
                        label="Tên chi nhánh/Khách Hàng"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Người nhận hàng"
                        name="receiver"
                        value={form.receiver}
                        onChange={handleChange}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Địa chỉ"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Số điện thoại"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        fullWidth
                        required
                    />
                    {error && <Alert severity="error">{error}</Alert>}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Hủy</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                    Tạo chi nhánh
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateBranchDialog;
