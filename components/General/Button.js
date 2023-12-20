
const Button = ({
    children,
    defaultStyleObj = {},
    classNameStr = "",
    backgroundColor = 'transparent',
    handleOnClick = () => { },
    ariaLabelStr = "button"
}) => {
    const _style = { ...defaultStyleObj, backgroundColor: backgroundColor }

    return (
        <button
            className={classNameStr}
            style={_style}
            onClick={handleOnClick}
            aria-label={ariaLabelStr}
        >
            {children}
        </button>
    );
}


export default Button;
