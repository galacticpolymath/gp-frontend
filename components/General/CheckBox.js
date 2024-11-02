/* eslint-disable react/jsx-indent */
/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent-props */

import { BiCheckbox, BiCheckboxChecked } from "react-icons/bi";

const CheckBox = ({
    isChecked,
    handleOnClick,
    children,
    txtStyle = {},
    txtClassName = "",
    checkBoxContainerClassName = "d-flex",
    checkBoxContainerStyle = {},
}) => {
    return (
        <div className={checkBoxContainerClassName} style={checkBoxContainerStyle}>
            <div className="pb-3">
                {isChecked ? (
                    <BiCheckboxChecked
                        onClick={handleOnClick}
                        fontSize="28px"
                        className="pb-1"
                    />
                )
                    : (
                        <BiCheckbox
                            onClick={handleOnClick}
                            fontSize="28px"
                            className='pb-1'
                        />
                    )}
            </div>
            <span
                style={txtStyle}
                className={txtClassName}
            >
                {children}
            </span>
        </div>
    );
};

export default CheckBox;