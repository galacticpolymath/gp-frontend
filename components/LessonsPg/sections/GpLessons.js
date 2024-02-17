/* eslint-disable no-console */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
import Image from 'next/image';
import GpLessonSvg from '../../../assets/img/gp-lesson-icon.svg';
import IndividualLesson from '../IndividualLesson';
import Pill from '../../Pill';
import { useGetGpDataStates } from '../../../customHooks/useGetGpDataStates';
import SeeMoreBtnSec from './SeeMoreBtnSec';

const GpLessons = ({
    didErrorOccur,
    startingLessonsToShow,
    isLast,
    nextPgNumStartingVal,
}) => {
    const { handleOnClick, btnTxt, gpDataObj } = useGetGpDataStates(startingLessonsToShow, isLast, nextPgNumStartingVal, 'lessons');

    return (
        <section>
            <div className='container'>
                <section className="lessonsSection pt-1">
                    <div className='ms-sm-4 galactic-black  mb-2 mb-sm-4 text-left mt-4 mx-4'>
                        <div className="d-flex">
                            <Image
                                src={GpLessonSvg}
                                style={{ height: 'fit-content' }}
                                alt='GP Unit Icon'
                            />
                            <h4 className="d-flex justify-content-center align-items-center">Galactic Polymath Individual Lessons</h4>
                        </div>
                        <p className='mt-2 mb-0'>Free lessons to engage students in current research, real world problems, and interdisciplinary thinking.</p>
                    </div>
                    {!!gpDataObj.data?.length && (
                        <div className='mx-auto grid justify-content-center align-items-center justify-content-sm-start align-items-sm-stretch pb-1 px-2 p-sm-4 gap-3 pt-3 pb-5'>
                            {(gpDataObj.data ?? startingLessonsToShow).map((lesson, index) => {
                                return (
                                    <IndividualLesson
                                        key={index}
                                        Pill={lesson.status === "Beta" ? <Pill xCoordinate={23} yCoordinate={-19} /> : null}
                                        lesson={{ ...lesson, _id: index }}
                                    />
                                );
                            })}
                        </div>
                    )}
                    {(!startingLessonsToShow?.length && didErrorOccur) && (
                        <div className='px-4 pb-4'>
                            <p className='text-center text-sm-start'>An error has occurred. Couldn&apos;t retrieve lessons. Please try again by refreshing the page.</p>
                        </div>
                    )}
                    {!gpDataObj.isLast && (
                        <SeeMoreBtnSec
                            btnTxt={btnTxt}
                            handleOnClick={handleOnClick}
                        />
                    )}
                </section>
            </div>
        </section>
    );
};

export default GpLessons;