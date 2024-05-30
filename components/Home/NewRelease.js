/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
import CustomLink from "../CustomLink";

const NewRelease = ({ newReleasePath, NewReleaseImage_src, sponsorImg }) => {
    return (
        <div className="container mx-auto row align-items-center justify-content-center">
            <h2 className="fw-light fs-1 text-center text-sm-start text-lg-center p-3 p-lg-4 mb-5">
                Think <strong>bigger</strong>.<br />{' '}
                Learn everything.
            </h2>
            <div className='container bg-white rounded-3 justify-content-center py-5 px-4'>
                <div className='row justify-content-center gy-5'>
                    <div className='col-12 offset-0 offset-md-1 col-md-7 col-lg-6'>
                        <CustomLink hrefStr={newReleasePath} className=' no-link-decoration object-fit-contain w-auto'>
                            <div className="position-relative mx-auto">
                                <img
                                    src={NewReleaseImage_src}
                                    className='lessonsPgShadow rounded-4 h-auto'
                                    style={{
                                        objectFit: 'contain',
                                        height: 1000,
                                        width: 1500,
                                    }}
                                    alt="Newest release card"
                                />
                                <div className='badge bg-secondary fs-6 text-center' style={{ zIndex: 15, position: 'absolute', top: '-10px', left: '-20px' }}>
                                    New release!
                                </div>
                            </div>
                        </CustomLink>
                    </div>
                    <div className='col-12 col-md-3 col-lg-3 d-grid justify-items-center align-content-center mx-auto'>
                        <h5 className='fw-light text-center'>Sponsor:</h5>
                        <div className=" w-80 mx-auto justify-content-center">
                            <img
                                src={sponsorImg}
                                className='w-100'
                                style={{ maxWidth: '500', objectFit: 'contain' }}
                                alt="John Templeton Foundation"
                            />
                        </div>
                        <div className='my-3'>
                            <h5 className='fw-light text-center'> Dr. Emilie Snell-Rood&apos;s Lab at the University of Minnesota</h5>
                        </div>

                    </div>
                </div>
                <div className='row mt-5 '>
                    <div className='col-12 col-md-8 justify-content-center d-flex'>
                        <CustomLink href={newReleasePath} className='btn btn-primary '>
                            See this lesson
                        </CustomLink>
                    </div>
                    <div className='col-0 col-md-4' />
                </div>
            </div>
            <div className="col-12 col-lg-10 offset-lg-1 px-4 py-3 my-5">
                <div className="display-4">We want to empower students with <em>agency</em> and <em>critical thinking</em>.</div>
                <p className="fs-3 pt-3">
                    Our lessons help build 21st Century Skills and foster lifelong curiosity.
                </p>
            </div>
        </div>
    );
};

export default NewRelease;