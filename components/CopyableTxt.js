import { useEffect, useState } from "react";

const CopyableTxt = ({ children, implementLogicOnClick, copyTxtIndicator = 'Copy text', txtCopiedIndicator = 'Text copied ✅!' }) => {
    const [isModalOn, setIsModalOn] = useState(false);
    const [modalTxt, setModalTxt] = useState(copyTxtIndicator);
    const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });

    const handleOnClick = () => {
        implementLogicOnClick()
        setModalTxt(txtCopiedIndicator);
    };

    const handleOnMouseEnter = () => {
        setIsModalOn(true);
    };

    const handleOnMouseLeave = () => {
        setIsModalOn(false);
        setModalTxt(copyTxtIndicator);
    };

    const handleOnMouseMove = event => {
        const { clientX, clientY } = event;
        setCoordinates({ x: clientX, y: clientY });
    };

    useEffect(() => {
        document.addEventListener('mousemove', handleOnMouseMove);

        return () => {
            document.removeEventListener('click', handleOnMouseMove);
        };
    }, []);

    return (
        <div
            className='pointer'
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
            onClick={handleOnClick}
        >
            {isModalOn && (
                <div
                    className='position-fixed rounded p-0 m-0'
                    style={{
                        position: 'fixed',
                        width: '110px',
                        left: `${coordinates.x + 10}px`,
                        top: `${coordinates.y + (-20)}px`,
                        backgroundColor: '#212529',
                        textAlign: 'center',
                    }}
                >
                    <span
                        className='text-white w-100 h-100 d-inline-flex justify-content-center align-items-center p-0 m-0'
                        style={{
                            fontSize: 12,
                            transform: 'translateY(-2px)',
                        }}
                    >
                        {modalTxt}
                    </span>
                </div>
            )}
            {children}
        </div>
    );
};

export default CopyableTxt;