/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */

const CardTitle = ({
    title,
    fontSize,
    style = {},
    className = 'w-light text-black mb-0 no-underline-on-hover',
}) => {
    let h3StyleObj = {
        ...style,
        textDecoration: 'none',
    };

    if (fontSize) {
        h3StyleObj.fontSize = fontSize;
    }

    return (
        <h3
            style={h3StyleObj}
            className={className}
        >
            {title}
        </h3>
    );
};

export default CardTitle;