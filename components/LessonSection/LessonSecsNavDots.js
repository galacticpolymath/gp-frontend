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

import { useState } from "react";
import NavDotLi from "./NavDots/NavDotLi";

const LessonsSecsNavDots = ({ _sectionDots }) => {
    const [sectionDots, setSectionDots] = _sectionDots;
    const [willShowTitles, setWillShowTitles] = useState(false);

    const handleMouseEnter = () => {
        setWillShowTitles(true);
    };

    const handleMouseLeave = () => {
        setWillShowTitles(false);
    };

    return (
        <div className="position-fixed lessonSecsNavDotsListContainer">
            <ul className='ps-0 mb-0 d-flex flex-column position-relative justify-content-center align-items-center' style={{ transform: 'translate3d(0px, 0px, 0px)', 'transition-duration': '3500ms', transition: 'all .15s ease-in' }}>
                {sectionDots.map(({ isInView, SectionTitle, sectionId, willShowTitle }, index) => (
                    <NavDotLi
                        key={index}
                        index={index}
                        isInView={isInView}
                        SectionTitle={SectionTitle}
                        sectionId={sectionId}
                        setSectionDots={setSectionDots}
                        willShowTitle={willShowTitle}
                        _willShowTitles={[willShowTitles, setWillShowTitles]}
                    />
                ))}
                {/* <div
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className="position-absolute end-0 h-100"
                    style={{ width: 20 }}

                /> */}
            </ul>
        </div>
    )
}

export default LessonsSecsNavDots;