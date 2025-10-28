/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
 
/* eslint-disable semi */
/* eslint-disable quotes */
 
import Image from 'next/image';

const Partner = ({ link, containerHeight, imgPath, alt, name, type, description, index }) => {
    return (
        <section className='partnerCompany pb-4 pb-lg-0 d-flex align-items-center flex-column' key={index}>
            <section style={{ minWidth: '220px' }} className='w-100 d-flex justify-content-center align-items-center'>
                <div className='rounded bg-white company-partner-img-container d-flex justify-content-center align-items-center pointer' style={{ height: '130px', width: '130px' }}>
                    <a href={link} target="_blank">
                        <div style={{ height: containerHeight, width: '110px' }} className='position-relative'>
                            <Image
                                src={imgPath}
                                alt={alt}
                                fill
                                sizes="110px"
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
                <p style={{ maxWidth: "450px", minWidth: "200px" }} className='w-100 text-center ps-lg-1 pe-lg-1 ps-xl-0 pe-xl-0'>{description}</p>
            </section>
        </section>
    )
}

export default Partner;