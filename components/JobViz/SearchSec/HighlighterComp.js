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
import CloseSearchResultsJobViz from "../Buttons/CloseSearchResultsJobViz";

const HighlighterComp = ({ handleCheckBoxChange, isHighlighterOn, closeSearchResultsModal }) => {

    return (
        <section className='switchMainContainer d-flex flex-column flex-sm-row mt-1 mt-sm-0'>
            <section className="h-100 d-flex justify-content-sm-center align-items-sm-center me-2">
                <span>Highlighter</span>
            </section>
            <section className="h-100 d-flex justify-content-sm-center align-items-sm-center mt-1 mt-sm-0">
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
            <section className="h-100 d-none d-sm-flex justify-content-center align-items-center">
                <CloseSearchResultsJobViz closeSearchResultsModal={closeSearchResultsModal} />
            </section>
        </section>
    )
}

export default HighlighterComp;