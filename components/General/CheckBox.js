 
 
 
 

import { BiCheckbox, BiCheckboxChecked } from "react-icons/bi";
import { FONT_SIZE_CHECKBOX } from "../User/Create/SignUpModal";

const CheckBox = ({
    isChecked,
    handleOnClick,
    children,
    txtStyle = {},
    txtClassName = "",
    checkBoxContainerClassName = "d-flex",
    checkBoxContainerStyle = {},
    checkBoxCheckedClassName = 'pb-1',
    checkBoxClassName = 'pb-1',
}) => {
    return (
        <div className={checkBoxContainerClassName} style={checkBoxContainerStyle}>
            <div>
                {isChecked ? (
                    <BiCheckboxChecked
                        onClick={handleOnClick}
                        fontSize={FONT_SIZE_CHECKBOX}
                        className={checkBoxCheckedClassName}
                    />
                )
                    : (
                        <BiCheckbox
                            onClick={handleOnClick}
                            fontSize={FONT_SIZE_CHECKBOX}
                            className={checkBoxClassName}
                        />
                    )}
            </div>
            <span
                onClick={handleOnClick}
                style={txtStyle}
                className={txtClassName}
            >
                {children}
            </span>
        </div>
    );
};

export default CheckBox;