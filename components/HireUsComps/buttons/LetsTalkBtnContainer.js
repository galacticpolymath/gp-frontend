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


const LetsTalkBtnContainer = ({ isBtnColorDarker, isMainBtn, isInReadyToInspireSec }) => {
    const _className = `${isMainBtn ? "mainBtnLetsTalk" : "letsTalkBtnContainer"} border-white d-flex flex-row-reverse flex-md-column ${isInReadyToInspireSec ? 'inReadyToInspireSec' : 'position-relative'} ${isBtnColorDarker ? 'darker-btn-color' : ''}`

    const handleOnClick = () => {
        window.open('https://portal.galacticpolymath.com/public/form/view/604d904c80fecb0cd51e2529', '_blank')
    }

    return (
        <div className={_className}>
            <div className="d-flex align-items-center justify-content-center">
                <MessageBoxIcon />
            </div>
            <div className="d-flex align-items-center justify-content-center">
                <span className="text-nowrap">Let's talk!</span>
            </div>
            <Button onClick={handleOnClick} className="w-100 h-100 noBackground noBorder position-absolute" />
        </div>
    )
}

export default LetsTalkBtnContainer;