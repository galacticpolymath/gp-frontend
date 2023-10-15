import React from 'react';
import Layout from '../Layout';
import ShareWidget from '../AboutPgComps/ShareWidget';
import LessonsSecsNavDots from '../LessonSection/LessonSecsNavDots';

const IS_ON_PROD = process.env.NODE_ENV === 'production'

const LessonPgLayout = ({
    states,
    fns,
    vars
}) => {
    const {
        _sectionDots,
        _wasDotClicked,
        _isScrollListenerOn,
    } = states;
    const {
        setWillGoToTargetSection,
        setIsScrollListenerOn,
        setWasDotClicked
    } = fns;
    const {
        availLocs,
        lastSubRelease,
        lesson,
        lessonBannerUrl,
        layoutProps,
        _sections,
        ref,
        isOnPreview,
        shareWidgetFixedProps
    } = vars;
    const lessonH1Props = isOnPreview ?
        { id: "lessonTitleId", className: "mt-2" }
        :
        { id: "lessonTitleId", ref: ref, className: "mt-2" }

    return (
        <Layout {...layoutProps}>
            <LessonsSecsNavDots
                _sectionDots={_sectionDots}
                setWillGoToTargetSection={setWillGoToTargetSection}
                setIsScrollListenerOn={setIsScrollListenerOn}
                isScrollListenerOn={_isScrollListenerOn[0]} setWasDotClicked={setWasDotClicked}
            />
            <ShareWidget {...shareWidgetFixedProps} />
            <div id="lessonTitleSec" className="container d-flex justify-content-center pt-4 pb-4">
                <div id="lessonTitleSecId" className="d-flex justify-content-center align-items-center SectionHeading lessonTitleId">
                    <div className="col-11 col-md-10">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }} className="flex-column flex-sm-row">
                            {lastSubRelease && (
                                <Link passHref href="#versions" style={{ color: 'black' }}>
                                    <p>
                                        Version {lastSubRelease.version}{' '}
                                        (Updated {format(new Date(lastSubRelease.date), 'MMM d, yyyy')})
                                    </p>
                                </Link>
                            )}
                            <LocDropdown
                                availLocs={availLocs}
                                loc={lesson.locale}
                                id={lesson.numID}
                            />
                        </div>
                        <h1 {...lessonH1Props}>{lesson.Title}</h1>
                        <h4 className='fw-light'>{lesson.Subtitle}</h4>
                        {lessonBannerUrl && (
                            <div className='w-100 position-relative mt-2 mb-2'>
                                <Image
                                    src={lessonBannerUrl}
                                    alt={lesson.Subtitle}
                                    width={1500}
                                    height={450}
                                    priority
                                    style={{ width: "100%", height: "auto", objectFit: 'contain' }}
                                />
                            </div>
                        )}
                        <div className='d-flex d-md-none'>
                            <label className='d-flex justify-content-center align-items-center'>Share: </label>
                            {IS_ON_PROD ? <ShareWidget pinterestMedia={lessonBannerUrl} /> : <ShareWidget developmentUrl={`${lesson.URL}/`} pinterestMedia={lessonBannerUrl} />}
                        </div>
                        <div className='row mt-4 d-flex flex-column flex-sm-row align-content-center'>
                            <div className="col-12 col-sm-8 col-md-8 col-lg-9 d-grid">
                                <h5>Sponsored by:</h5>
                                <RichText content={lesson.SponsoredBy} />
                            </div>
                            <div className="col-6 col-sm-4 col-md-4 col-lg-3 m-auto d-grid">
                                {sponsorLogoImgUrl && (
                                    <div style={{ height: "180px" }} className='position-relative sponsorImgContainer d-sm-block d-flex justify-content-center align-items-center w-100'>
                                        <Image
                                            src={Array.isArray(sponsorLogoImgUrl) ? sponsorLogoImgUrl[0] : sponsorLogoImgUrl}
                                            alt={lesson.Subtitle}
                                            className='sponsorImg'
                                            sizes="225px"
                                            fill
                                            style={{ width: "100%", objectFit: 'contain' }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="px-1 px-sm-4 container d-flex justify-content-center selectedLessonPg pt-4 pb-4">
                <div className="col-11 col-md-10 p-0">
                    {_sections.map((section, index) => (
                        <ParentLessonSection
                            key={index}
                            section={section}
                            ForGrades={lesson.ForGrades}
                            index={index}
                            _sectionDots={_sectionDots}
                            _wasDotClicked={_wasDotClicked}
                            _isScrollListenerOn={_isScrollListenerOn}
                        />
                    )
                    )}
                </div>
            </div>
        </Layout>
    );
}

export default LessonPgLayout;
