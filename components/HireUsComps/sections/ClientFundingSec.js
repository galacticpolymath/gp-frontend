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
