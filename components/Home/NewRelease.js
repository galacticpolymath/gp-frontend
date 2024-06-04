/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
import CustomLink from "../CustomLink";

const NewRelease = ({ newReleasePath, NewReleaseImage_src, sponsorImgPath, sponsorImgAlt, releaseInfoTxt, customCss = '' }) => {
    return (
        <div className='row justify-content-center'>
            <div className='pt-3 col-12 offset-0 offset-md-1 col-md-7 col-lg-6'>
                <CustomLink hrefStr={newReleasePath} className='bg-danger no-link-decoration object-fit-contain w-auto'>
                    <div className="position-relative mx-auto d-flex justify-content-center align-items-center d-md-block px-3 px-md-0">
                        <img
                            src={NewReleaseImage_src}
                            sizes="60vw"
                            className='lessonsPgShadow new-release-img rounded-4 h-auto'
                            style={{
                                objectFit: 'contain',
                            }}
                            alt="Newest release card"
                        />
                        <div className='badge new-release-badge bg-secondary fs-6 text-center position-absolute'>
                            New release!
                        </div>
                    </div>
                </CustomLink>
                <div className='d-flex justify-content-center align-items-center mt-3'>
                    <CustomLink hrefStr={newReleasePath} className='btn btn-primary py-2 py-sm-2 px-1 px-sm-4 px-md-5 px-lg-4 see-this-lesson-btn'>
                        See this lesson
                    </CustomLink>
                </div>
            </div>
            <div className={`col-12 col-md-3 col-lg-4 mt-3 mt-md-0 ${customCss}`}>
                <h5 className='fw-light text-center'>Sponsor:</h5>
                <div className="w-80 mx-auto justify-content-center">
                    <img
                        src={sponsorImgPath}
                        className='w-100 sponsor-img-release'
                        style={{ maxWidth: '400px', objectFit: 'contain' }}
                        alt={sponsorImgAlt}
                    />
                </div>
                <div className='my-3'>
                    <h5 className='fw-light text-center text-wrap px-3 px-md-0'>{releaseInfoTxt}</h5>
                </div>
            </div>
        </div>
    );
};

export default NewRelease;