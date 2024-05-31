/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
import CustomLink from "../CustomLink";

const NewRelease = ({ newReleasePath, NewReleaseImage_src, sponsorImgPath, sponsorImgAlt }) => {
    return (
        <div className='row justify-content-center'>
            <div className='pt-3 col-12 offset-0 offset-md-1 col-md-7 col-lg-6'>
                <CustomLink href={newReleasePath} className='bg-danger no-link-decoration object-fit-contain w-auto'>
                    <div className="position-relative mx-auto">
                        <img
                            src={NewReleaseImage_src}
                            sizes="60vw"
                            className='lessonsPgShadow rounded-4 h-auto'
                            style={{ objectFit: 'contain', height: "900px", width: "800px" }}
                            alt="Newest release card"
                        />
                        <div className='badge bg-secondary fs-6 text-center' style={{ zIndex: 15, position: 'absolute', top: '-10px', left: '-20px' }}>
                            New release!
                        </div>
                    </div>
                </CustomLink>
                <div className='offset-3 mt-3'>
                    <CustomLink href={newReleasePath} className='btn btn-primary '>
                        See this lesson
                    </CustomLink>
                </div>
            </div>
            <div className='col-12 col-md-3 col-lg-3 pt-3 pt-lg-5'>
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
                    <h5 className='fw-light text-center text-wrap'> Dr. Emilie Snell-Rood&apos;s Lab at the University of Minnesota</h5>
                </div>
            </div>
        </div>
    );
};

export default NewRelease;