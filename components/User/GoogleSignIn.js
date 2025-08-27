/* eslint-disable no-debugger */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent-props */
import { FcGoogle } from "react-icons/fc";
import Button from "../General/Button";
import { signIn } from "next-auth/react";

const GoogleSignIn = ({
    children,
    callbackUrl = "",
    handleGoogleBtnClickCustom,
    style = {},
    className = "rounded p-2 d-flex justify-content-center align-items-center border",
    isLoggingIn = false,
    executeExtraBtnClickLogic = null,
    executeFinallyBlockLogic = null,
}) => {
    if (!children) {
        children = (
            <>
                <FcGoogle className="mx-2" />
                <span style={{ fontSize: "16px" }}>Sign in with Google.</span>
            </>
        );
    }

    const handleGoogleBtnClickDefault = (event) => {
        try {
            event.preventDefault();

            // TODo: delete all cookies

            if (typeof executeExtraBtnClickLogic === "function") {
                executeExtraBtnClickLogic();
            }

            if (!callbackUrl) {
                console.error("The callback url cannot be empty.");
                return;
            }

            if (isLoggingIn) {
                localStorage.setItem("userEntryType", JSON.stringify("login"));
            }

            signIn("google", { callbackUrl: callbackUrl });
        } catch (error) {
            console.log('An error has occurred: ', error);
        } finally {
            if (typeof executeFinallyBlockLogic === 'function') {
                executeFinallyBlockLogic();
            }
        }
    };

    return (
        <Button
            defaultStyleObj={style}
            backgroundColor="white"
            classNameStr={className}
            handleOnClick={
                typeof handleGoogleBtnClickCustom === "function"
                    ? handleGoogleBtnClickCustom
                    : handleGoogleBtnClickDefault
            }
        >
            {children}
        </Button>
    );
};

export default GoogleSignIn;
