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

const HighlighterComp = ({ handleCheckBoxChange, isHighlighterOn, closeSearchResultsModal, isNotOnSmScreen }) => {
    const parentClassName = `switchMainContainer ${isNotOnSmScreen ? 'd-none d-sm-flex' : 'd-flex d-none'} flex-row` 
    
    return (
        <section className={parentClassName}>
            <section className="h-100 d-flex justify-content-center align-items-center me-2">
                <span>Highlighter</span>
            </section>
            <section className="h-100 d-flex justify-content-center align-items-center">
                <div className="switchContainer">
                    <label className="switch w-100 h-100">
                        <input
                            type="checkbox"
                            onChange={handleCheckBoxChange}
                            checked={isHighlighterOn}
                        />
                        <span className="sliderForBtn round"></span>
                    </label>
                </div>
            </section>
            {isNotOnSmScreen &&
                <section className="h-100 d-flex justify-content-center align-items-center">
                    <button
                        className="searchResultsCloseBtn noBtnStyles"
                        onClick={closeSearchResultsModal}
                    >
                        <AiOutlineClose id="searchResultsCloseIcon" />
                    </button>
                </section>
            }
        </section>
    )
}

export default HighlighterComp;