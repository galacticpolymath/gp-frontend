/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent-props */

// 'txt' must be a string
const EllipsisTxt = ({ children: txt, ellipsisTxtNum = 3, style = {} }) => {
    return (
        <div
            style={style}
            className={`ellipsize-txt-${ellipsisTxtNum}`}
        >
            {txt}
        </div>
    );
};

export default EllipsisTxt;