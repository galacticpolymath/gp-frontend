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

const LessonsSecsNavDots = ({ _sectionDots }) => {
    const [sectionDots, setSectionDots] = _sectionDots;
    const [willShowTitles, setWillShowTitles] = useState(false);

    const handleMouseEnter = () => {
        setSectionDots(sectionDots => sectionDots.map(sectionDot => {
            return {
                ...sectionDot,
                willShowTitle: true,
            }
        }));
    };

    const handleMouseLeave = () => {
        console.log("mouse left...")
        setSectionDots(sectionDots => sectionDots.map(sectionDot => {
            return {
                ...sectionDot,
                willShowTitle: false,
            }
        }));
    };

    const scrollSectionIntoView = sectionId => {
        const targetSection = document.getElementById(sectionId);
        targetSection && targetSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        console.log("scrolling...")
    }

    const handleDotClick = sectionId => {
        console.log("was clicked...")
        setSectionDots(sectionDots => sectionDots.map(sectionDot => {
            return {
                ...sectionDot,
                willShowTitle: true,
            }
        }));
        scrollSectionIntoView(sectionId);
    }

    const goToSection = sectionId => {
        console.log("hey there")
        scrollSectionIntoView(sectionId);
    }

    const liNavDotFns = { goToSection, handleDotClick }

    // when the user clicks on a dot, have the section title appear on the ui 

    return (
        <div className="position-fixed lessonSecsNavDotsListContainer d-flex">
            <ul onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className='ps-0 d-none d-lg-flex flex-column position-relative justify-content-center align-items-center h-100' style={{ transform: 'translate3d(0px, 0px, 0px)', 'transitionDuration': '3500ms', transition: 'all .15s ease-in' }}>
                {sectionDots.map((section, index) => (
                    <LiNavDot
                        key={index}
                        fns={liNavDotFns}
                        section={section}
                        index={index}
                        isOnDesktop
                    />
                ))}
            </ul>
            <ul className='ps-0 d-flex d-lg-none flex-column position-relative justify-content-center align-items-center h-100' style={{ transform: 'translate3d(0px, 0px, 0px)', 'transitionDuration': '3500ms', transition: 'all .15s ease-in' }}>
                {sectionDots.map((section, index) => (
                    <LiNavDot
                        key={index}
                        fns={liNavDotFns}
                        section={section}
                        index={index}
                    />
                ))}
            </ul>
        </div>
    )
}

export default LessonsSecsNavDots;