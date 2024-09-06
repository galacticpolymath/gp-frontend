/* eslint-disable react/jsx-indent */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */

import { useState } from "react";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

/**
 * @typedef {(
 *   "button" |
 *   "checkbox" |
 *   "color" |
 *   "date" |
 *   "datetime-local" |
 *   "email" |
 *   "file" |
 *   "hidden" |
 *   "image" |
 *   "month" |
 *   "number" |
 *   "password" |
 *   "radio" |
 *   "range" |
 *   "reset" |
 *   "search" |
 *   "submit" |
 *   "tel" |
 *   "text" |
 *   "time" |
 *   "url" |
 *   "week"
 * )} TInputType

/**
 *  @global 
 * * @typedef {'input-focus-blue' | 'border-grey-dark'} TFocusCss
 * 
 */

/**
 * 
 * @param {{ inputType: TInputType }} param0 
 * @returns 
 */
export const CustomInput = ({
    onChange,
    placeholder = '',
    inputId,
    inputName,
    autoFocus = false,
    inputContainerCss,
    inputType = 'text',
    inputClassName = 'px-1 py-2 position-relative no-outline border-0 rounded',
    iconContainerClassName = 'h-100 end-0 position-absolute top-0 transparent d-flex justify-content-center align-items-center',
    isPasswordInput = false,
    inputStyle = {},
    iconContainerStyle = {},
}) => {
    /**
    * @type {[TFocusCss, import('react').Dispatch<import('react').SetStateAction<TFocusCss>>]}
    */
    const [focusCssInput, setFocusCssInput] = useState("border-grey-dark");
    const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false);

    /**
     * 
     * @param {TFocusCss} focusCssInput 
     */
    const handleFocusabilityCss = focusCssInput => () => {
        setFocusCssInput(focusCssInput);
    };

    return (
        <div className={`${inputContainerCss} ${focusCssInput}`}>
            <input
                style={inputStyle}
                id={inputId}
                name={inputName}
                autoFocus={autoFocus}
                onFocus={handleFocusabilityCss('input-focus-blue')}
                onBlur={handleFocusabilityCss('border-grey-dark')}
                type={isPasswordInput ? (isConfirmPasswordShown ? 'text' : 'password') : inputType}
                onChange={onChange}
                placeholder={placeholder}
                className={inputClassName}
            />
            {isPasswordInput && (
                <div
                    style={iconContainerStyle}
                    className={iconContainerClassName}
                >
                    <div style={{ height: '95%' }} className='d-flex justify-content-center align-items-center'>
                        {isConfirmPasswordShown ?
                            (
                                <IoMdEye
                                    fontSize="25px"
                                    className='pointer'
                                    onClick={() => setIsConfirmPasswordShown(state => !state)}
                                />
                            )
                            :
                            (
                                <IoMdEyeOff
                                    fontSize="25px"
                                    className='pointer'
                                    onClick={() => setIsConfirmPasswordShown(state => !state)}
                                />
                            )
                        }
                    </div>
                </div>
            )
            }
        </div>
    );
};

export const InputSection = ({
    errors,
    errorsFieldName,
    label,
    inputId,
    inputPlaceholder,
    inputName,
    containerClassName = "d-flex flex-column col-sm-6 position-relative",
    labelClassName = "",
    inputStyle = { borderRadius: '5px', fontSize: '18px', background: '#D6D6D6' },
    inputElement = null,
    handleOnInputChange = () => { },

}) => {
    return (
        <div className={containerClassName}>
            <label
                className={labelClassName}
                htmlFor={inputId}
            >
                {label}
            </label>
            {inputElement ?? (
                <input
                    id={inputId}
                    placeholder={inputPlaceholder}
                    style={inputStyle}
                    className="border-0 p-1 w-100 py-2"
                    name={inputName}
                    onChange={event => {
                        handleOnInputChange(event);
                    }}
                />
            )}
            <section style={{ height: '29px' }}>
                {errors.has(errorsFieldName) && <ErrorTxt>{errors.get(errorsFieldName)}</ErrorTxt>}
            </section>
        </div>
    );
};

export const ErrorTxt = ({
    children,
    style = { fontSize: '16px' },
    className = 'text-danger',
}) => {
    return (
        <span style={style} className={className}>
            {children}
        </span>
    );
};
