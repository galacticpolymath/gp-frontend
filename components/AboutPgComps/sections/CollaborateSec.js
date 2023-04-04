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
import Image from 'next/image';
import Button from 'react-bootstrap/Button';

const CollaborateSec = () => {
    
    const handleBtnClick = () => {
        window.open('mailto:info@galacticpolymath.com')
    }

    return (
        <section className='container-fluid d-flex flex-column pb-5'>
            <section className='row d-flex flex-column justify-content-center align-items-center'>
                <section className='col-12 d-flex justify-content-center align-items-center flex-column'>
                    <h3 className='fs-4 mb-0 mb-sm-3 d-flex d-sm-block text-uppercase text-center flex-column fw-light position-relative'>
                        Want to get involved?
                        <Image
                            src='/imgs/about/humanWaveEmoji.png'
                            alt='Collaborate_Galactic_Polymath_Section'
                            className='position-absolute collaborateImg d-none d-sm-block end-0 top-0'
                            width={160}
                            height={80}
                            size='160px'
                            style={{
                                objectFit: 'contain',
                            }}
                        />
                        <span className='d-flex-inline d-sm-none w-100 justify-content-center align-items-center'>
                            <Image
                                src='/imgs/about/humanWaveEmoji.png'
                                alt='Collaborate_Galactic_Polymath_Section'
                                width={160}
                                height={80}
                                size='160px'
                                style={{
                                    objectFit: 'contain',
                                }}
                            />
                        </span>
                    </h3>
                    <p style={{ maxWidth: '750px' }} className='fs-6 mt-1 d-md-block d-none'>
                        We're a small, but dedicated team at the moment. Please get in touch if you're interested in volunteering or contracting out your coding, webdev, art, graphic design, or lesson design skills; collaborating in some other way; or perhaps joining the team full-time when funding is available!
                    </p>
                    <p style={{ maxWidth: '750px' }} className='fs-6 mt-1 text-center text-md-start d-md-block d-none'>
                        * If you're a grad student on a GRFP or an NSF-funded RA, please check out {" "}
                        <a href="https://docs.google.com/document/d/1fTYA8-2YQDPHyKN9SB23dLCcR77bbGOhwIG7SLN2yGg/preview" target='_blank' className='underline-on-hover pointer'>this potential funding opportunity!</a>
                    </p>
                    <p style={{ maxWidth: '550px' }} className='fs-6 mt-sm-0 mt-sm-1 text-center d-md-none d-block'>
                        We're a small, but dedicated team at the moment. Please get in touch if you're interested in volunteering or contracting out your coding, webdev, art, graphic design, or lesson design skills; collaborating in some other way; or perhaps joining the team full-time when funding is available!
                    </p>
                    <p style={{ maxWidth: '550px' }} className='fs-6 mt-1 text-center d-md-none d-block'>
                        * If you're a grad student on a GRFP or an NSF-funded RA, please check out {" "}
                        <a href="https://docs.google.com/document/d/1fTYA8-2YQDPHyKN9SB23dLCcR77bbGOhwIG7SLN2yGg/preview" target='_blank' className='underline-on-hover pointer'>this potential funding opportunity!</a>
                    </p>
                </section>
                <section className='col-12 d-flex justify-content-center align-items-center mt-4'>
                    <Button 
                        variant='primary' 
                        className="pointer"
                        onClick={handleBtnClick}
                    >
                        GET IN TOUCH!
                    </Button>
                </section>
            </section>
        </section>
    )
}

export default CollaborateSec
