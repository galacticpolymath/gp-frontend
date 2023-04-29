/* eslint-disable brace-style */
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
import { useInViewport } from 'react-in-viewport';
import { useIsVisible } from 'react-is-visible'

const useLessonElementInView = (_sectionDots, SectionTitle, ref) => {
    const inView = useIsVisible(ref);
    let h2Id = SectionTitle.replace(/[\s!]/gi, '_').toLowerCase();
    const [, setSectionDots] = _sectionDots;
    const [wasRendered, setWasRendered] = useState(false);

    useEffect(() => {
        setWasRendered(true);
    }, [])

    // useEffect(() => {
    //     if (inView && wasRendered) {
    //         setSectionDots(sectionDots => {
    //             return {
    //                 ...sectionDots,
    //                 clickedSectionId: null
    //             }
    //         });
    //     }
    // }, [inView, wasRendered]);

    return { inView, h2Id: h2Id }
}

export default useLessonElementInView;