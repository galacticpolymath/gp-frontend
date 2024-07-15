/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
import Button from "../General/Button";

const LoginContainerForNavbar = () => {
    const handleOnClick = () => {

    };

    return (
        <div className='position-absolute end-0'>
            <Button
                classNameStr='rounded px-3'
                backgroundColor='#303134'
                handleOnClick={handleOnClick}
            >
                <span style={{ color: 'white', fontWeight: 410 }} className="">
                    LOGIN
                </span>
            </Button>
        </div>
    );
};

export default LoginContainerForNavbar;