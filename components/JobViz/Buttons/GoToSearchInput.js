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
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import Fade from "../../Fade";

const GoToSearchInput = ({ searchInputRef, isScrollToInputBtnVisible }) => {

    const goToSearchInput = () => {
        document.getElementById("searchInputField").scrollIntoView({ block: 'center', align: 'center' });
    }

    return (
        <Fade showElement={isScrollToInputBtnVisible}>
            <Button
                className={`position-fixed goToSearchInputBtn rounded-circle`}
                onClick={goToSearchInput}
            >
                Go to search input
            </Button>
        </Fade>
    )
}

export default GoToSearchInput