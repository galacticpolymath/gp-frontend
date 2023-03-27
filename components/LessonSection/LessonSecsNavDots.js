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
        }));
        !willShowTitles && setWillShowTitles(true);
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
            setWillShowTitles(false)
        }

        scrollSectionIntoView(sectionId);
    }
    const liNavDotFns = { goToSection, handleDotClick }

    return (
        <div className="position-fixed lessonSecsNavDotsListContainer d-flex">
            <SectionTitlesUl sectionDots={sectionDots} willShowTitles={willShowTitles} goToSection={goToSection} />
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