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

const Partners = () => {
    return (
        <section className='container-fluid pt-3'>
            <section className='row'>
                <section className='col-12 d-flex justify-content-center align-items-center flex-column'>
                    <h3 className='fs-4 mb-3 text-uppercase fw-light'>PARTNERS</h3>
                    <p style={{ maxWidth: '900px' }} className='fs-5 text-center'>The amazing organizations we work with to generate high quality multimedia, develop new education tools, and improve access to STEM careers for underserved communities.</p>
                </section>
            </section>
            <section className='row'>
                <section className='col-12 d-flex justify-content-center'>
                    {CompanyPartners.map(({ name, type, imgPath, alt, description, link }, index) => {
                        const containerHeight = (index === 2) ? '40px' : '110px';
                        const parentSecMargin = index === 1 ? 'ms-4 me-4' : ''

                        return (
                            <section className={`w-25 d-flex align-items-center flex-column ${parentSecMargin}`} key={index}>
                                <section className='w-100 d-flex justify-content-center align-items-center'>
                                    <div className='rounded bg-white shadow d-flex justify-content-center align-items-center' style={{ height: '130px', width: '130px' }}>
                                        <a href={link} target="_blank">
                                            <div style={{ height: containerHeight, width: '110px' }} className='position-relative'>
                                                <Image
                                                    src={imgPath}
                                                    alt={alt}
                                                    fill
                                                    style={{
                                                        object: 'contain',
                                                    }}
                                                />
                                            </div>
                                        </a>
                                    </div>
                                </section>
                                <section className='mt-4'>
                                    <h4 className='text-center'>{name}</h4>
                                    <h6 className='text-center fw-light text-muted'>{type}</h6>
                                    <p className='text-center'>{description}</p>
                                </section>
                            </section>
                        )
                    })}
                </section>
            </section>
        </section>
    )
}

export default Partners;
