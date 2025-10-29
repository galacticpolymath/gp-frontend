/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-indent-props */
 
/* eslint-disable semi */
 
/* eslint-disable react/jsx-max-props-per-line */
 
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */

import CardContainer from '../CardContainer'
import clientFundingSourcesPics from '../../../data/HireUsPg/clientFundingSourcesPics.json'

const ClientFundingSec = ({ isMobile }) => {
    return (
        isMobile ?
            <section className="mt-5 d-md-none">
                <CardContainer headingTxt="Our Clients' Funding Sources" pics={clientFundingSourcesPics} autoCarouselHeadingTxtClassNames="ourClientsFundingSourcesHeadingTxt fw200 text-dark" isCardOnly />
            </section>
            :
            <section className="mt-5 d-none d-md-block">
                <CardContainer
                    headingTxt="Our Clients' Funding Sources"
                    pics={clientFundingSourcesPics}
                    autoCarouselHeadingTxtClassNames="ourClientsFundingSourcesHeadingTxt fw200 text-white"
                    dynamicCssClasses=' clientFundingDesktop'
                    isCardOnly
                />
            </section>
    )
}

export default ClientFundingSec;
