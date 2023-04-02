/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable curly */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable no-unused-vars */
/* eslint-disable semi */
/* eslint-disable quotes */
/* eslint-disable no-console */
import CompanyPartners from '../../../data/AboutPg/Partners.json';
import Image from 'next/image'
import Partner from '../childOfSections/Partner';

const Partners = () => {
    return (
        <section style={{ height: 'fit-content' }} className='container-fluid pt-3 pb-5 partnerSec'>
            <section className='row'>
                <section className='col-12 d-flex justify-content-center align-items-center flex-column'>
                    <h3 className='fs-4 mb-3 text-uppercase fw-light'>PARTNERS</h3>
                    <p style={{ maxWidth: '900px' }} className='fs-5 text-center'>The amazing organizations we work with to generate high quality multimedia, develop new education tools, and improve access to STEM careers for underserved communities.</p>
                </section>
            </section>
            <section className='row mt-3'>
                <section className='d-flex flex-wrap flex-column flex-lg-row justify-content-center align-items-center'>
                    {CompanyPartners.map(({ name, type, imgPath, alt, description, link }, index) => {
                        const containerHeight = (index === 2) ? '40px' : '110px';
                        {/* const parentSecMargin = index === 1 ? 'ms-4 me-4' : '' */}
                        const props = { name: name, type: type, imgPath: imgPath, containerHeight: containerHeight, alt: alt, description: description, link: link }

                        return <Partner key={index} {...props} />

                    })}
                </section>
            </section>
        </section>
    )
}

export default Partners;
