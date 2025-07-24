import { useState, createContext, useContext } from "react";

// Tạo context để quản lý việc refresh dữ liệu
const DataRefreshContext = createContext();

export const DataRefreshProvider = ({ children }) => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const triggerRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <DataRefreshContext.Provider value={{ refreshTrigger, triggerRefresh }}>
            {children}
        </DataRefreshContext.Provider>
    );
};

export const useDataRefresh = () => {
    const context = useContext(DataRefreshContext);
    if (!context) {
        throw new Error("useDataRefresh must be used within a DataRefreshProvider");
    }
    return context;
};

export default useDataRefresh;