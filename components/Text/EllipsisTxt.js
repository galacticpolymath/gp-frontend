/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent-props */

// 'txt' must be a string
const EllipsisTxt = ({ children: txt, ellipsisTxtNum = 3, style = {}, className = '' }) => {
    return (
        <div
            style={style}
            className={`ellipsize-txt-${ellipsisTxtNum} ${className}`}
        >
            {txt}
        </div>
    );
};

export default EllipsisTxt;