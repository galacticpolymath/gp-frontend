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

import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer"
import { useInViewport } from 'react-in-viewport';

// WHAT IS HAPPENING:
// the h2Id is wrong

const useLessonElementInView = (_sectionDots, SectionTitle, ref) => {
    const { inViewport: inView } = useInViewport(ref);    
    let h2Id = SectionTitle.replace(/[\s!]/gi, '_').toLowerCase();
    const [, setSectionDots] = _sectionDots;

    useEffect(() => {
        if (inView) {
            setSectionDots(sectionDots => sectionDots.map(sectionDot => {
                if ((sectionDot.sectionId === h2Id) && inView) {
                    return {
                        ...sectionDot,
                        isInView: true,
                    };
                }

                return {
                    ...sectionDot,
                    isInView: false,
                };
            }));
        }
    }, [inView]);

    return { inView, h2Id: h2Id }
}

export default useLessonElementInView;