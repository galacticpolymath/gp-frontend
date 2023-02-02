/* eslint-disable semi */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */

const HireUsCardSection = ({ text, content, mobileTxt, dynamicCss }) => {
    return (
        <section className={dynamicCss ?? 'HireUCardSectionParent'}>
            <div className="d-none d-md-flex flex-column infoCardHireUs justify-content-md-center align-items-md-center justify-content-lg-start align-items-lg-stretchs">
                <section className="d-flex justify-content-center w-100">
                    <h4 className="hireUsCardTxt pe-1 text-dark hireUsCardSectionTxt fwtHireUsCard">{text}</h4>
                </section>
                <div className="hireUsInfoStyledContainer mt-lg-4 mt-xl-0 w-100 border-dark d-none d-md-flex justify-content-center align-items-center">
                    <section className="d-flex justify-content-center align-items-center w-75">
                        {content}
                    </section>
                </div>
            </div>
            <div className="d-flex flex-column d-md-none mt-sm-0">
                <section className="d-flex justify-content-center ps-3 pe-3 pt-2 pt-md-5 ps-sm-0 pe-sm-0">
                    <span className="text-dark hireUsCardTxt responsiveInfoTxt text-center text-sm-start">
                        {mobileTxt}
                    </span>
                </section>
                <section className="d-flex justify-content-center align-items-center w-100 mt-4 mt-sm-5 pt-1 pt-md-4 pb-4">
                    {content}
                </section>
            </div>
        </section>
    )
}

export default HireUsCardSection;