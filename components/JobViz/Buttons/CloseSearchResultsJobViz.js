/* eslint-disable quotes */
 
/* eslint-disable semi */
 
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