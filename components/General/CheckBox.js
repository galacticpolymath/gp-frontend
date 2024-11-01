/* eslint-disable react/jsx-indent */
/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent-props */

import { BiCheckbox, BiCheckboxChecked } from "react-icons/bi";

const CheckBox = ({ isChecked, handleOnClick, children, txtStyle = {}, txtClassName = "", checkBoxContainerClassName = "d-flex", checkBoxContainerStyle = {} }) => {
    return (
        <div className={checkBoxContainerClassName} style={checkBoxContainerStyle}>
            <div>
                {isChecked ? (
                    <BiCheckboxChecked
                        onClick={handleOnClick}
                        fontSize="21px"
                    />
                )
                    : (
                        <BiCheckbox
                            onClick={handleOnClick}
                            fontSize="21px"
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