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
    <section className="howMuchDoesItCostSec">
        <section className="pt-5 ps-sm-5 pe-sm-5">
            <h3 className="noMargin">How much does it cost?</h3>
        </section>
        {/* mt-4 mb-5 */}
        <section className="w-100 d-flex justify-content-start align-items-center flex-row flex-md-column ps-1 pe-1 ps-sm-5 pe-sm-5 mt-sm-4 mb-3">
            <span className="pt-3 pt-sm-0 fw200 fst-italic text-dark text-center text-sm-start ps-1 ps-sm-0 pe-1 pe-sm-0">
                We offer three standard packages, which we’re happy to customize to meet your specific needs.
                <span className="d-md-none ms-1">Here are three standard options to use as a starting point.</span>
            </span>
            <span className="d-none d-md-inline fw200 fst-italic text-dark mt-2">Here are three standard options to use as a starting point<span className='d-inline d-xl-none'>.</span><span className='d-none d-xl-inline'>:</span></span>
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
        <section className="d-none d-md-flex d-xl-none flex-column justify-content-center align-items-center cardsCentralizedSec">
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