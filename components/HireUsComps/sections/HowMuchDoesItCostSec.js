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
import tiers from '../../../data/HireUsPg/tiers.json'
import Tier from './Tier';


const HowMuchDoesItCostSec = ({setTiersInfoForModalArr}) => (
    <section className="howMuchDoesItCostSec mt-4">
        <section className="ps-sm-5 pe-sm-5">
            <h3 className="display-1 noMargin">How much does it cost?</h3>
        </section>
        <section className="w-100 d-flex justify-content-start align-items-center flex-row flex-md-column mt-4 mb-5 ps-1 pe-1 ps-sm-5 pe-sm-5">
            <span className="fs-large fw200 fst-italic text-dark text-center text-sm-start ps-1 ps-sm-0 pe-1 pe-sm-0">
                We offer three standard packages, which we’re happy to customize to meet your specific needs.
                <span className="d-md-none ms-1">Here are three standard options to use as a starting point.</span>
            </span>
            <span className="d-none d-md-inline fs-large fw200 fst-italic text-dark mt-2">Here are three standard options to use as a starting point.</span>
        </section>
        <section className="d-md-flex ps-md-5 pe-md-5">
            {tiers.map((tier, index) => {
                return (
                    <Tier
                        isNoBackground={index !== 1}
                        key={index}
                        tier={tier}
                        setTiersInfoForModalArr={setTiersInfoForModalArr}
                    />
                )
            })}
        </section>
    </section>
)


export default HowMuchDoesItCostSec;