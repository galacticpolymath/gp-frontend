const Button = ({
  children,
  fontSize,
  isDisabled,
  value,
  defaultStyleObj = {},
  classNameStr = '',
  backgroundColor = 'transparent',
  handleOnClick = () => { },
  ariaLabelStr = 'button',
  btnType = 'button',
}) => {
  const _style = { ...defaultStyleObj, backgroundColor: backgroundColor };

  if (fontSize) {
    _style.fontSize = fontSize;
  }

  return (
    <button
      type={btnType}
      disabled={isDisabled}
      className={classNameStr}
      style={_style}
      onClick={handleOnClick}
      aria-label={ariaLabelStr}
      value={value}
    >
      {children}
    </button>
  );
};

export default Button;
