/* eslint-disable no-multiple-empty-lines */
/* eslint-disable quotes */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable no-console */
/* eslint-disable react/jsx-first-prop-new-line */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable semi */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */

import infoTxtsFirstSec from '../../../data/HireUsPg/infoTxtsFirstSec.json'
import HireUsCardFirstSecMobile from '../HireUsCardFirstSecMobile'

const WhatDoWeDoSec = () => {
    return (
        <section className="d-flex flex-column">
            <section className="d-flex ps-sm-5 pe-sm-5">
                <h3 className="text-center text-sm-start w-100 text-sm-nowrap">
                    What do we do?
                </h3>
            </section>
            <section className="pb-4 mt-3 ps-sm-5 pe-sm-5">
                <span className='d-sm-none bolder text-wrap text-dark text-center w-100 d-block responsiveInfoTxt'>
                    We mobilize knowledge
                </span>
                <span className="hireUsCardIntroTxt d-inline-block responsiveInfoTxt text-center text-sm-start ps-3 pe-3 ps-sm-0 pe-sm-1">
                    <span className='bolder text-sm-nowrap d-none d-sm-inline-block'>
                        We mobilize knowledge
                    </span>
                    <span className='ms-2 fwtHireUsCard'>
                        by turning our clients outreach goals into rich, open-access learning experiences.
                    </span>
                </span>
            </section>
            <section className="ps-sm-5 pe-sm-5">
                <div className="d-none d-md-flex flex-row whatDoWeDoSec">
                    {infoTxtsFirstSec.map((textsAndImg, index) => <HireUsCardFirstSecMobile key={index} textsAndImg={textsAndImg} customCssClass='weMobileKnowledgeSec' />)}
                </div>
            </section>
            <div className="d-flex d-md-none flex-column ps-sm-5 pe-sm-5 ms-4 me-4 ms-sm-5 me-sm-5 whatDoWeDoSec pb-5">
                {infoTxtsFirstSec.map((textsAndImg, index) => <HireUsCardFirstSecMobile key={index} textsAndImg={textsAndImg} index={index} />)}
            </div>
        </section>
    )
}

export default WhatDoWeDoSec;
