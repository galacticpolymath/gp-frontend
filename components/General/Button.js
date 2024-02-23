const Button = ({
  children,
  fontSize,
  isDisabled,
  defaultStyleObj = {},
  classNameStr = '',
  backgroundColor = 'transparent',
  handleOnClick = () => { },
  ariaLabelStr = 'button',
}) => {
  const _style = { ...defaultStyleObj, backgroundColor: backgroundColor };

  if (fontSize) {
    _style.fontSize = fontSize;
  }

  return (
    <button
      disabled={isDisabled}
      className={classNameStr}
      style={_style}
      onClick={handleOnClick}
      aria-label={ariaLabelStr}
    >
      {children}
    </button>
  );
};

export default Button;
