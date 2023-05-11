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


const HowMuchDoesItCostSec = ({ setTiersInfoForModalArr }) => (
    <section className="howMuchDoesItCostSec pb-5 mb-3">
        <section className="pt-5 ps-sm-5 pe-sm-5">
            <h3 className="noMargin">How much does it cost?</h3>
        </section>
        <section className="w-100 text-dark d-flex justify-content-start align-items-center flex-row flex-md-column ps-1 pe-1 ps-sm-5 pe-sm-5 mt-sm-4 mb-3">
            <div className="pt-3 pt-sm-0 fw200 fst-italic text-center text-sm-start ps-1 ps-sm-0 pe-1 pe-sm-0">
                We offer three standard packages, which we’re happy to customize to meet your specific needs.
            </div>
            <span className="d-md-none ms-2">Here are three standard options to use as a starting point.</span>
            <span className="d-none d-md-inline fst-italic mt-2">Here are three standard options to use as a starting point.</span>
        </section>
        <section className="d-flex d-md-none d-xl-flex flex-column flex-xl-row ps-md-5 pe-md-5">
            {tiers.map((tier, index) => {
                return (
                    <Tier
                        isNoBackground={index !== 1}
                        key={index}
                        index={index}
                        tier={tier}
                        setTiersInfoForModalArr={setTiersInfoForModalArr}
                    />
                )
            })}
        </section>
        <section className="d-none d-md-flex d-xl-none flex-column justify-content-center align-items-center ">
            {tiers.map((tier, index) => {
                return (
                    <Tier
                        isNoBackground={index !== 1}
                        index={index}
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