/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
import Button from "../../General/Button";

const SeeMoreBtnSec = ({ handleOnClick, btnTxt }) => {
    return (
        <div className='w-100 d-flex justify-content-center align-items-center pb-3'>
            <Button
                handleOnClick={handleOnClick}
                backgroundColor="#E9EBEE"
                fontSize={19}
                classNameStr="text-center w-25 rounded no-btn-styles p-3 border"
            >
                {btnTxt}
            </Button>
        </div>
    );
};

export default SeeMoreBtnSec;