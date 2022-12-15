/* eslint-disable semi */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */

const HireUsCardSection = ({text, content}) => {
    return (
        <div className="bg-white hireUsInfoStyledContainer d-flex border-dark mt-4">
            <section className="d-flex justify-content-center w-50 pt-5 ps-5">
                <h4 className="hireUsCardTxt">{text}</h4>
            </section>
            <section className="d-flex justify-content-center align-items-center w-50 pe-5">
                {content}
            </section>
        </div>
    )
}

export default HireUsCardSection;