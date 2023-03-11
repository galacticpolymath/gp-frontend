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

import { AiOutlineClose } from "react-icons/ai"

const CloseSearchResultsJobViz = ({ closeSearchResultsModal, willShowOnlyOnSmScreen }) => {
    const parentClass = willShowOnlyOnSmScreen ? "d-flex d-sm-none position-absolute top-0 closeSearchResultsJobVizBtn" : "d-flex";

    return (
        <button
            className={`searchResultsCloseBtn noBtnStyles ${parentClass}`}
            onClick={closeSearchResultsModal}
        >
            <AiOutlineClose id="searchResultsCloseIcon" />
        </button>
    )
}

export default CloseSearchResultsJobViz;