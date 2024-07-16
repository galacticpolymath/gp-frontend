/* eslint-disable quotes */
import { useState } from "react";

/* eslint-disable indent */
export const useLogin = () => {
    const [userErrorType, setUserErrorType] = useState('');

    const sendUserInputToServer = (userInput = { email: '', password: '' }) => {
        if (!userInput.email || !userInput.password) {
            setUserErrorType('emptyInputs');
            return;
        }

        const { email, password } = userInput;

    };

    return { sendUserInputToServer, userErrorType };
};