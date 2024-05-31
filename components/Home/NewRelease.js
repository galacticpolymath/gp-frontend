/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
import CustomLink from "../CustomLink";

const NewRelease = ({ newReleasePath, NewReleaseImage_src, sponsorImgPath, sponsorImgAlt }) => {
    return (
        <>
            <div className='row justify-content-center gy-5'>
                <div className='col-12 offset-0 offset-md-1 col-md-7 col-lg-6'>
                    <CustomLink href={newReleasePath} className=' no-link-decoration object-fit-contain w-auto'>
                        <div className="position-relative mx-auto">
                            <img
                                src={NewReleaseImage_src}
                                width={1500}
                                sizes="60vw"
                                className='lessonsPgShadow rounded-4 h-auto'
                                style={{ objectFit: 'contain', height: "1000px", width: "1500px" }}
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
                            src={sponsorImgPath}
                            className='w-100'
                            style={{ maxWidth: '500', objectFit: 'contain' }}
                            alt={sponsorImgAlt}
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
        </>
    );
};

export default NewRelease;