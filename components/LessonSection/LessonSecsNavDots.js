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
import SectionTitlesUl from "./NavDots/SectionTitlesUl";

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
        console.log('targetSection to scroll to: ', targetSection)
        targetSection && targetSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    const handleDotClick = sectionId => {
        setSectionDots(sectionDots => sectionDots.map(sectionDot => {
            return {
                ...sectionDot,
                willShowTitle: true,
            }
        }));
        setWillShowTitles(true);
        console.log('sectionId: ', sectionId)
        scrollSectionIntoView(sectionId);
    }

    const goToSection = sectionId => {
        console.log('sectionId: ', sectionId)
        scrollSectionIntoView(sectionId);
    }

    const liNavDotFns = { goToSection, handleDotClick }

    // detect when the user clicks anywhere on the page except when clicking on a nav dot or a section title. Do this within a useEffect hook

    return (
        <div className="position-fixed lessonSecsNavDotsListContainer d-flex">
            <SectionTitlesUl sectionDots={sectionDots} willShowTitles={willShowTitles} goToSection={goToSection} />
            <ul onMouseEnter={handleMouseEnterIconList} onMouseLeave={handleMouseLeaveIconList} className='ps-0 d-none d-lg-flex flex-column position-relative justify-content-center align-items-center h-100' style={{ transform: 'translate3d(0px, 0px, 0px)', 'transitionDuration': '3500ms', transition: 'all .15s ease-in' }}>
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
            <ul className='ps-0 d-flex d-lg-none flex-column position-relative justify-content-center align-items-center h-100' style={{ transform: 'translate3d(0px, 0px, 0px)', 'transitionDuration': '3500ms', transition: 'all .15s ease-in' }}>
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