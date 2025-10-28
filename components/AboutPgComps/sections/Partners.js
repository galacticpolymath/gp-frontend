/* eslint-disable react/jsx-indent */
 
/* eslint-disable indent */
 
/* eslint-disable semi */
/* eslint-disable quotes */
 
import CompanyPartners from '../../../data/AboutPg/Partners.json';
import Image from 'next/image'
import Partner from '../sectionChildren/Partner';

const Partners = () => {
    return (
        <section style={{ height: 'fit-content' }} className='container-fluid pt-3 pb-5 partnerSec'>
            <section className='row'>
                <section className='col-12 d-flex justify-content-center align-items-center flex-column'>
                    <h3 className='fs-4 mb-3 text-uppercase fw-light'>PARTNERS</h3>
                    <p style={{ maxWidth: '900px' }} className='fs-5 text-center'>The amazing organizations we work with to generate high quality multimedia, develop new education tools, and improve access to STEM careers for underserved communities.</p>
                </section>
            </section>
            <section className='row mt-3 d-flex justify-content-center align-items-center'>
                <section style={{ width: "1440px" }} className='d-flex flex-wrap flex-column flex-lg-row justify-content-center align-items-center'>
                    {CompanyPartners.map(({ name, type, imgPath, alt, description, link }, index) => {
                        const containerHeight = (index === 2) ? '40px' : '110px';
                        const props = { name: name, type: type, imgPath: imgPath, containerHeight: containerHeight, alt: alt, description: description, link: link }

                        return <Partner key={index} {...props} />

                    })}
                </section>
            </section>
        </section>
    )
}

export default Partners;
