/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable react/jsx-tag-spacing */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable react/jsx-first-prop-new-line */
/* eslint-disable brace-style */
/* eslint-disable comma-dangle */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable quotes */
/* eslint-disable semi */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */

import LetsTalkBtnContainer from "../buttons/LetsTalkBtnContainer"

const WhenShouldIReachOutSec = () => {
    return (
        <section className="mt-5 ps-sm-5 pe-sm-5 d-flex pb-2 pb-sm-5 pb-xl-0 flex-column">
            <section className="ps-2 pe-2 ps-sm-0 pe-sm-0">
                <h3 className="noMargin">When should I reach out?</h3>
            </section>
            <section className="d-flex flex-column flex-md-row anyTimeSec">
                <section className="mt-3">
                    <span className="text-dark d-block w-100 w-sm-85 fw249 text-center text-sm-start ps-2 pe-2 ps-sm-0 pe-sm-0 pe-xl-5">
                        Any time! Whether you have funds now, want to write us into a proposal, or just have a question, we are here to help!
                    </span>
                </section>
                <section className="d-flex mt-4 d-sm-block justify-content-center justify-content-sm-start align-items-sm-stretch align-items-sm-center">
                    <div className="d-flex justify-content-center align-items-center d-md-none d-sm-block btnContainerWhenShouldIReach">
                        <LetsTalkBtnContainer isDarker />
                    </div>
                    <div className="d-none d-md-block btnContainerWhenShouldIReach">
                        <LetsTalkBtnContainer isNoUnderline isDarker />
                    </div>
                </section>
            </section>
        </section>
    )
}

export default WhenShouldIReachOutSec;