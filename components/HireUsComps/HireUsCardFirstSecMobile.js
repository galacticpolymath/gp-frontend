/* eslint-disable no-multiple-empty-lines */
/* eslint-disable semi */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
import Image from 'next/image';

const HireUsCardFirstSecMobile = ({ textsAndImg }) => {
    const { boldedTxt, unBoldedText, imgPath } = textsAndImg;


    return (
        <section className="mt-4 d-flex">
            <section className="pt-2">
                <Image src={imgPath} width={75} height={75} alt="Galactic_PolyMath_First_Sec_Mobile_Info" />
            </section>
            <section className="w-75 ms-4">
                <span className="d-inline-block hireUsCardFirstSecTxt">
                    <span className='bolder text-dark'>
                        {boldedTxt}
                    </span>
                    <span className='ms-2 text-dark fwtHireUsCard'>
                        {unBoldedText}
                    </span>
                </span>
            </section>
        </section>
    )
}

export default HireUsCardFirstSecMobile;