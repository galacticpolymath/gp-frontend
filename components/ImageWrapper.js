/* eslint-disable semi */
 
/* eslint-disable react/jsx-indent */

const ImageWrapper = ({ children, customCss }) => (
    <div className={`position-relative imgWrapperStyles ${customCss}`}>
        {children}
    </div>
)

export default ImageWrapper;
