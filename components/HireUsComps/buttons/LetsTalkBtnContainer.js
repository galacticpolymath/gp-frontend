/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable semi */
/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable prefer-template */
/* eslint-disable comma-dangle */
/* eslint-disable quotes */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */

import MessageBoxIcon from '../../svgs/MessageBoxIcon';
import Button from 'react-bootstrap/Button';


const LetsTalkBtnContainer = () => {
    return (
        <div className="letsTalkBtnContainer border-white d-flex flex-row-reverse flex-md-column position-relative">
            <div className="d-flex align-items-center justify-content-center">
                <MessageBoxIcon />
            </div>
            <div className="d-flex align-items-center justify-content-center">
                <span>Let's talk!</span>
            </div>
            <Button className="w-100 h-100 noBackground noBorder position-absolute" />
        </div>
    )
}

export default LetsTalkBtnContainer;