/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
import { useContext } from "react";
import { ModalContext } from "../../../providers/ModalProvider";
import Button from "../../General/Button";

const LoginContainerForNavbar = ({ className = "position-relative" }) => {
    const { _isLoginModalDisplayed } = useContext(ModalContext);
    const [, setIsLoginModalDisplayed] = _isLoginModalDisplayed;

    const handleOnClick = () => {
        setIsLoginModalDisplayed(true);
    };

    return (
        <div className={`login-container ${className}`}>
            <Button
                handleOnClick={handleOnClick}
                classNameStr='rounded px-3 border-0'
                backgroundColor="#333438"
            >
                <span style={{ color: 'white', fontWeight: 410 }}>
                    LOGIN
                </span>
            </Button>
        </div>
    );
};

export default LoginContainerForNavbar;