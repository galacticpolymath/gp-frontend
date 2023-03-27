/* eslint-disable react/jsx-key */
/* eslint-disable no-undef */
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

import { useEffect, useState } from "react";
import LiNavDot from "./NavDots/LiNavDot";
import { v4 } from "uuid";

const LessonsSecsNavDots = ({ _sectionDots }) => {
    const [sectionDots, setSectionDots] = _sectionDots;
    const [willShowTitles, setWillShowTitles] = useState(false);

    const handleMouseEnterIconList = () => {
        setWillShowTitles(true);
    };

    const handleMouseLeaveIconList = () => {
        setWillShowTitles(false);
    };

    const scrollSectionIntoView = sectionId => {
        const targetSection = document.getElementById(sectionId);

        targetSection && targetSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    const handleDotClick = sectionId => {
        setSectionDots(sectionDots => sectionDots.map(sectionDot => {
            const { sectionId: _sectionId, willShowTitle } = sectionDot;
            if (_sectionId === sectionId) {
                console.log("dot was clicked on mobile: ", _sectionId === sectionId)
                return {
                    ...sectionDot,
                    willShowTitle: !willShowTitle,
                }
            }

            return {
                ...sectionDot,
                willShowTitle: false,
            }
        })
        );
    }

    useEffect(() => {
        console.log("sectionDots: ", sectionDots)
    }, [sectionDots])

    const goToSection = (sectionId, isOnMobile) => {
        if (isOnMobile) {
            setSectionDots(sectionDots => sectionDots.map(sectionDot => {
                return {
                    ...sectionDot,
                    willShowTitle: false,
                }
            }));
        }

        scrollSectionIntoView(sectionId);
    }
    const liNavDotFns = { goToSection, handleDotClick }

    return (
        <div className="position-fixed lessonSecsNavDotsListContainer d-flex">
            <ul className='ps-0 mb-0 d-flex flex-column position-relative justify-content-center align-items-center h-100' style={{ transform: 'translate3d(0px, 0px, 0px)', 'transition-duration': '3500ms', transition: 'all .15s ease-in' }}>
                {sectionDots.map(({ isInView, SectionTitle, willShowTitle, sectionId }, index) => {
                    
                    return (
                        <div key={index}>
                            <li
                                className='d-none d-lg-inline-flex justify-content-end'
                                role='button'
                                style={{ borderColor: !isInView ? 'rgb(190, 190, 190)' : '#363636 1px solid !important', opacity: willShowTitles ? 1 : 0, transition: "all .15s ease-in", height: "30px", 'width': '200px', transitionProperty: 'border-color, opacity' }}
                            >
                                <span style={{ transition: "all .15s ease-in", backgroundColor: isInView ? '#d5e6f3' : 'white', border: '#363636 1px solid', transitionProperty: 'border, background-color, opacity', fontWeight: 400, padding: 6 }} className='text-black  text-nowrap shadow rounded d-lg-inline-flex justify-content-center align-items-center d-none'>
                                    {SectionTitle}
                                </span>
                            </li>
                            <li
                                className='d-lg-none d-inline-flex justify-content-end'
                                role='button'
                                style={{ border: 'none', opacity:  willShowTitle ? 1 : 0, transition: "all .15s ease-in", height: "30px", 'width': '200px', transitionProperty: 'border-color, display' }}
                            >
                                <span
                                    style={{ transition: "all .15s ease-in", backgroundColor: isInView ? '#d5e6f3' : 'white', border: '#363636 1px solid', transitionProperty: 'background-color, opacity, border', fontWeight: 400, padding: 6 }}
                                    className='text-black text-nowrap shadow rounded d-inline-flex d-lg-none justify-content-center align-items-center'
                                    onClick={_ => goToSection(sectionId, true)}
                                >
                                    {SectionTitle}
                                </span>
                            </li>
                        </div>
                    )
                })}
            </ul>
            <ul onMouseEnter={handleMouseEnterIconList} onMouseLeave={handleMouseLeaveIconList} className='ps-0 d-none d-lg-flex flex-column position-relative justify-content-center align-items-center h-100' style={{ transform: 'translate3d(0px, 0px, 0px)', 'transition-duration': '3500ms', transition: 'all .15s ease-in' }}>
                {sectionDots.map(({ isInView, sectionId }, index) => (
                    <LiNavDot
                        key={index}
                        fns={liNavDotFns}
                        isInView={isInView}
                        sectionId={sectionId}
                        index={index}
                        isOnDesktop
                    />
                ))}
            </ul>
            <ul className='ps-0 d-flex d-lg-none flex-column position-relative justify-content-center align-items-center h-100' style={{ transform: 'translate3d(0px, 0px, 0px)', 'transition-duration': '3500ms', transition: 'all .15s ease-in' }}>
                {sectionDots.map(({ isInView, sectionId }, index) => (
                    <LiNavDot
                        key={index}
                        fns={liNavDotFns}
                        isInView={isInView}
                        sectionId={sectionId}
                        index={index}
                    />
                ))}
            </ul>
        </div>
    )
}

export default LessonsSecsNavDots;