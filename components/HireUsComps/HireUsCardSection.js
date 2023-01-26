/* eslint-disable semi */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */

const HireUsCardSection = ({ text, content, mobileTxt }) => {
    return (
        <>
            <section className="d-none d-md-flex flex-column infoCardHireUs justify-content-md-center align-items-md-center justify-content-lg-start align-items-lg-stretch">
                <section className="d-flex justify-content-center w-100">
                    <h4 className="hireUsCardTxt pe-1 text-dark hireUsCardSectionTxt fwtHireUsCard">{text}</h4>
                </section>
                <div className="hireUsInfoStyledContainer w-100 border-dark mt-4 d-none d-md-flex justify-content-center align-items-center">
                    <section className="d-flex justify-content-center align-items-center w-75">
                        {content}
                    </section>
                </div>
            </section>
            <section className="d-flex flex-column d-md-none">
                <section className="d-flex justify-content-center ps-3 pe-3 pt-5 ps-sm-0 pe-sm-0">
                    <span className="text-dark hireUsCardTxt responsiveInfoTxt text-center text-sm-start">
                        {mobileTxt}
                    </span>
                </section>
                <div className="d-flex justify-content-center align-items-center w-100 mt-5 pt-4 pb-4">
                    {content}
                </div>
            </section>
        </>
    )
}

export default HireUsCardSection;