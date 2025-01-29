/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */

const GpWebApps = ({
    webApps,
    handleGpWebAppCardClick = app => { },
}) => {
    return (
        <>
            {webApps.map((webApp, index) => {
                return (
                    <div
                        key={index}
                        onClick={handleGpWebAppCardClick(webApp)}
                        className="position-relative pointer g-col-12 g-col-lg-6 g-col-xl-4 mx-md-auto d-grid p-3 bg-white rounded-3 lessonsPgShadow jobVizCardOnLessonsPg"
                    >
                        <section className="d-flex flex-column w-100">
                            <div
                                className='w-100 position-relative d-flex align-items-start'
                            >
                                <img
                                    src={webApp.webAppPreviewImg}
                                    alt='web-app'
                                    style={{
                                        objectFit: 'contain',
                                        maxHieght: '200px',
                                    }}
                                    className='w-100 h-100'
                                />
                            </div>
                            <section className="d-flex justify-content-center align-items-left flex-column">
                                <h4 className='fw-light text-black mb-0 pb-1 text-left mt-2'>
                                    {webApp.title}
                                </h4>
                                <span style={{ lineHeight: '20px', transform: 'translateY(5px)' }} className="text-black text-left mt-1 mt-sm-0">
                                    {webApp.description}
                                </span>
                            </section>
                        </section>
                    </div>
                );
            })}
        </>
    );
};

export default GpWebApps;