/* eslint-disable semi */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
import whatYouWillGetTxts from '../../../data/HireUsPg/whatYouWillGetTxts.json'
import HireUsCardFirstSecMobile from '../HireUsCardFirstSecMobile'

const WhatYouWillGetSec = () => (
    <section className="whatYouWillGetMainSec mt-5">
        <section className="d-flex ps-sm-5 pe-sm-5">
            <h3 className="text-center text-sm-start w-100 text-sm-nowrap">
                What will you get?
            </h3>
        </section>
        <section className="d-flex d-md-block flex-column ps-sm-5 pe-sm-5 flex-md-row pb-5 pb-xl-0 mt-0 mt-md-4 whatYouWillGetSec">
            {whatYouWillGetTxts.map((textsAndImg, index) => <HireUsCardFirstSecMobile isWhatWillYouGetSec={true} key={index} textsAndImg={textsAndImg} index={index} customCssClass='whatWillYouGetSec' />)}
        </section>
    </section>
)

export default WhatYouWillGetSec;