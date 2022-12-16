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
            <div className="bg-white hireUsInfoStyledContainer border-dark mt-4 d-none d-md-flex">
                <section className="d-flex justify-content-center w-50 pt-5 ps-5">
                    <h4 className="hireUsCardTxt pe-1 text-dark">{text}</h4>
                </section>
                <section className="d-flex justify-content-center align-items-center ms-2 w-50 pe-5">
                    {content}
                </section>
            </div>
            <section className="border-danger d-flex flex-column d-md-none">
                <section className="d-flex justify-content-center pt-5 ps-4 pe-4">
                    <span className="text-dark hireUsCardTxt">
                        {mobileTxt}
                    </span>
                </section>
                <div className="d-flex justify-content-center align-items-center bg-white w-100 mt-5 pt-4 pb-4">
                    {content}
                </div>
            </section>
        </>
    )
}

export default HireUsCardSection;