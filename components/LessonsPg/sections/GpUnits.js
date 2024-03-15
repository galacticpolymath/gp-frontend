/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable no-console */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
import UnitIconSvg from '../../../assets/img/gp-unit-icon.svg';
import Pill from '../../Pill';
import LessonCard from '../LessonCard';
import SeeMoreBtnSec from './SeeMoreBtnSec';
import { useGetGpDataStates } from '../../../customHooks/useGetGpDataStates';
import Image from 'next/image';
import ReactLoading from 'react-loading';

const getLessonImgSrc = lesson => {
    const { CoverImage, LessonBanner } = lesson;

    if (lesson.PublicationStatus === "Coming Soon") {
        return "https://storage.googleapis.com/gp-cloud/icons/coming-soon_Banner.png";
    }

    if (LessonBanner && !(CoverImage && CoverImage.url)) {
        return LessonBanner;
    }

    return CoverImage.url;
};

const UnshowableLesson = () => (
    <div
        className="w-100 pointer d-flex justify-content-center align-items-center disable-underline-a-tags g-col-sm-12 g-col-md-6 g-col-lg-6 g-col-xl-4 mx-auto d-grid p-3 bg-white rounded-3 cardsOnLessonPg"
    >
        <p style={{ fontWeight: 700 }} className="text-center">Not shown on Lessons page.</p>
    </div>
);

const GpUnits = ({
    startingUnitsToShow,
    isLast,
    nextPgNumStartingVal,
    didErrorOccur,
    totalGpUnitsNum,
}) => {
    const { handleOnClick, btnTxt, gpDataObj } = useGetGpDataStates(startingUnitsToShow, isLast, nextPgNumStartingVal, 'units', totalGpUnitsNum);

    return (
        <section className="lessonsSection pt-1">
            <div className='ms-sm-4 galactic-black  mb-2 mb-sm-4 text-left mt-4 mx-4'>
                <div className="d-flex">
                    <Image
                        src={UnitIconSvg}
                        style={{ height: 'fit-content' }}
                        alt='GP Unit Icon'
                    />
                    <h4 className="d-flex justify-content-center align-items-center">Galactic Polymath Mini-Unit Releases</h4>
                </div>
                <p className='mt-2 mb-0'> Each unit has 2-6 lessons created through 100s of collaborative hours by scientists, teachers, artists, and filmmakers. </p>
                <p><em>And they&apos;re all free!</em></p>
            </div>
            {!!gpDataObj.data?.length && (
                <div className='mx-auto grid pb-1 p-4 gap-3 pt-3 pb-5'>
                    {(gpDataObj.data ?? startingUnitsToShow).map((lesson, index) => {
                        return (
                            (lesson.PublicationStatus === 'Proto') ?
                                <UnshowableLesson key={index} />
                                : (
                                    <LessonCard
                                        key={lesson._id}
                                        lesson={lesson}
                                        lessonImgSrc={getLessonImgSrc(lesson)}
                                        BetaPillComp={(lesson.PublicationStatus === "Beta") || (lesson.PublicationStatus === "Draft") ? <Pill /> : null}
                                    />
                                )
                        );
                    })}
                </div>
            )}
            {(!gpDataObj.data?.length && didErrorOccur) && (
                <div className='px-4 pb-4'>
                    <p className='text-center text-sm-start'>An error has occurred. Couldn&apos;t retrieve lessons. Please try again by refreshing the page.</p>
                </div>
            )}
            {!gpDataObj.isLast && (
                <SeeMoreBtnSec
                    btnTxt={btnTxt}
                    handleOnClick={handleOnClick}
                >
                    {(btnTxt === 'Loading')
                        ?
                        <span style={{ height: 25 }} className='d-inline-flex justify-content-center align-items-center w-100 position-relative'>
                            <ReactLoading
                                type='bubbles'
                                color='#444444'
                                className='loading-bubbles'
                            />
                        </span>
                        :
                        <span className='d-inline-flex w-100 h-100 justify-content-center'>
                            {btnTxt}
                        </span>
                    }
                </SeeMoreBtnSec>
            )}
        </section>
    );
};

export default GpUnits;