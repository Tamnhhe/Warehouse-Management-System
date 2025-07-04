import { useContext } from "react";
import NotyfContext from "../Contexts/NotyfContext";

const useNotification = () => {
    const notyf = useContext(NotyfContext);

    const showSuccessMessage = (message) => {
        notyf.open({
            type: "success",
            message: message,
            duration: 2500,
            ripple: true,
            dismissible: false,
            position: {
                x: "right",
                y: "top",
            },
        });
    };

    const showErrorMessage = (message) => {
        notyf.open({
            type: "danger",
            message: message,
            duration: 2500,
            ripple: true,
            dismissible: false,
            position: {
                x: "right",
                y: "top",
            },
        });
    };

    return [showSuccessMessage, showErrorMessage];
};

export default useNotification;
