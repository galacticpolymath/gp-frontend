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
        <section className="row text-dark my-5 py-3">
            <div className="col-1 col-md-2"/>
            <div className="col-12 col-md-6">
                <h2 className="text-left ">When should I reach out?</h2>
                <span className="fs-5">
                    Any time! Whether you have funds now, want to write us into a proposal, or just have a question, we are here to help!
                </span>
                <div className="d-flex justify-content-left ps-3 mt-4">
                    <LetsTalkBtnContainer isDarker />
                </div>
            </div>
        </section >
    )
}

export default WhenShouldIReachOutSec;