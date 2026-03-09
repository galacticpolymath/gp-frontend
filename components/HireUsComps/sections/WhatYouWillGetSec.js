 
 
 
 
 
import whatYouWillGetTxts from '../../../data/HireUsPg/whatYouWillGetTxts.json'
import HireUsCardFirstSecMobile from '../HireUsCardFirstSecMobile'

const WhatYouWillGetSec = () => (
    <section className="whatYouWillGetMainSec mt-5">
        <section className="d-flex ps-sm-5 pe-sm-5">
            <h3 className="text-center text-sm-start w-100 text-sm-nowrap">
                What will you get?
            </h3>
        </section>
        <section className="d-flex d-md-block flex-column mt-3 mt-sm-0 ps-sm-5 pe-sm-5 flex-md-row pb-5 pb-xl-0 mt-0 mt-md-4 whatYouWillGetSec justify-content-sm-center align-items-sm-center justify-content-md-start align-items-md-stretch">
            {whatYouWillGetTxts.map((textsAndImg, index) => <HireUsCardFirstSecMobile isWhatWillYouGetSec={true} key={index} textsAndImg={textsAndImg} index={index} customCssClass='whatWillYouGetSec' />)}
        </section>
    </section>
)

export default WhatYouWillGetSec;