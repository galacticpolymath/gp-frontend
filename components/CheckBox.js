import { BiCheckbox, BiCheckboxChecked } from "react-icons/bi"
import { FONT_SIZE_CHECKBOX } from "./User/Create/SignUpModal";

const CheckBox = ({
    children,
    isChecked,
    handleCheckBoxClick,
    didErr,
}) => {
    return (
        <div style={{ width: '100%' }} className='d-flex create-account-toggle-btn-container'>
            <div>
                {isChecked ? (
                    <BiCheckboxChecked
                        onClick={handleCheckBoxClick}
                        fontSize={FONT_SIZE_CHECKBOX}
                        className='pointer'
                    />
                )
                    : (
                        <BiCheckbox
                            onClick={handleCheckBoxClick}
                            color={didErr ? 'red' : ""}
                            fontSize={FONT_SIZE_CHECKBOX}
                            className='pointer'
                        />
                    )}
            </div>
            <label
                onClick={handleCheckBoxClick}
                className={`${didErr ? 'text-danger' : ''} pointer`}
                style={{
                    fontSize: "18px",

                }}
            >
                {children}
            </label>
        </div>
    )
}

export default CheckBox;