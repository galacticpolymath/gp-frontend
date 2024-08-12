/* eslint-disable react/jsx-indent */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */

import { useUserEntry } from "../../customHooks/useUserEntry";

export const InputSection = ({
    errors,
    errorsFieldName,
    label,
    inputId,
    inputPlaceholder,
    inputName,
    containerClassName = "d-flex flex-column col-sm-6 position-relative",
    labelClassName = "",
    inputAndLabelSectionClassName = "",
    inputClassName = "",
    inputStyle = { borderRadius: '5px', fontSize: '18px', background: '#D6D6D6' },

}) => {
    const { handleOnInputChange } = useUserEntry();

    return (
        <div className={containerClassName}>
            <label
                className={labelClassName}
                htmlFor={inputId}
            >
                {label}
            </label>
            <input
                id={inputId}
                placeholder={inputPlaceholder}
                style={{ borderRadius: '5px', fontSize: '18px', background: '#D6D6D6' }}
                className="border-0 p-1 w-100 py-2"
                name={inputName}
                onChange={event => {
                    handleOnInputChange(event);
                }}
            />
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
