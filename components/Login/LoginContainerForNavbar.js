/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
import { useContext } from "react";
import Button from "../General/Button";
import { ModalContext } from "../../providers/ModalProvider";
import { signIn } from "next-auth/react";

const LoginContainerForNavbar = ({ className = "position-relative" }) => {
    const { _isLoginModalDisplayed } = useContext(ModalContext);
    const [, setIsLoginModalDisplayed] = _isLoginModalDisplayed;

    const handleOnClick = () => {
        // signIn("google", { email: "gtorion97work@gmail.com" })
        setIsLoginModalDisplayed(true);
    };

    return (
        <div className={`login-container ${className}`}>
            <Button
                classNameStr='rounded px-3 border-0'
                handleOnClick={handleOnClick}
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