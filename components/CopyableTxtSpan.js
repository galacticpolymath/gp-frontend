import { useEffect, useState } from 'react';

const CopyableTxtSpan = ({
  children,
  implementLogicOnClick,
  copyTxtIndicator = 'Copy text',
  txtCopiedIndicator = 'Text copied ✅!',
  copyTxtModalDefaultStyleObj = {
    position: 'fixed',
    width: '110px',
    backgroundColor: '#212529',
    textAlign: 'center',
  },
  additiveYCoord = -20,
  additiveXCoord = 0,
  modalClassNameStr = 'position-fixed rounded p-0 m-0',
  txtClassName = 'text-white w-100 h-100 d-inline-flex justify-content-center align-items-center p-0 m-0',
  txtStyleObj = {
    fontSize: 12,
    transform: 'translateY(-2px)',
  },
  pointerContainerStyle = {},
  parentClassName = 'pointer',
}) => {
  const [isModalOn, setIsModalOn] = useState(false);
  const [modalTxt, setModalTxt] = useState(copyTxtIndicator);
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  let copyTxtModalStylesObj = {
    ...copyTxtModalDefaultStyleObj,
    top: `${coordinates.y + additiveYCoord}px`,
    left: `${coordinates.x + additiveXCoord}px`,
  };

  const handleOnClick = event => {
    implementLogicOnClick(event);
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
    <span
      className={parentClassName}
      style={pointerContainerStyle}
      onMouseEnter={handleOnMouseEnter}
      onMouseLeave={handleOnMouseLeave}
      onClick={handleOnClick}
    >
      {isModalOn && (
        <div
          className={modalClassNameStr}
          style={copyTxtModalStylesObj}
        >
          <span
            className={txtClassName}
            style={txtStyleObj}
          >
            {modalTxt}
          </span>
        </div>
      )}
      {children}
    </span>
  );
};

export default CopyableTxtSpan;