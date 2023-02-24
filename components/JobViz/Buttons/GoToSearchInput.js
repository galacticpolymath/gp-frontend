/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable quotes */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable no-unexpected-multiline */
/* eslint-disable semi */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable no-console */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
import { Button } from "react-bootstrap";
import Fade from "../../Fade";
import { IoArrowUp } from 'react-icons/io5';

const GoToSearchInput = ({ isScrollToInputBtnVisible }) => {

    const goToSearchInput = () => {
        document.getElementById("searchInputField").scrollIntoView({ block: 'center', behavior: 'smooth' });
    }

    return (
        <Fade showElement={isScrollToInputBtnVisible} containerId="searchInputBtnId">
            <Button
                className={`position-fixed jobVizNavBtn goToSearchInputBtn rounded-circle d-flex flex-column`}
                onClick={goToSearchInput}
            >
                <span className="w-100 text-center h-50 d-flex justify-content-center align-items-center">
                    <IoArrowUp />
                </span>
                <span className="w-100 h-50 d-none d-sm-flex justify-content-center align-items-center pb-4">
                    Go to search
                </span>
                <span className="w-100 h-50 d-flex d-sm-none justify-content-center align-items-center pb-4">
                    Search
                </span>
            </Button>
        </Fade>
    )
}

export default GoToSearchInput