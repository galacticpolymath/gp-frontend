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

const getLastTwoSecs = isAvailLocsMoreThan1 => [{ sectionTitle: '10. Acknowledgments', txtIdToAdd: isAvailLocsMoreThan1 ? 'heading' : "11." }, { sectionTitle: '11. Version Notes', txtIdToAdd: isAvailLocsMoreThan1 ? 'heading' : "12." }]

const useLessonElementInView = (_sectionDots, SectionTitle, ref, isAvailLocsMoreThan1) => {
    const { inViewport: inView } = useInViewport(ref);    
    const lastTwoSecs = getLastTwoSecs(isAvailLocsMoreThan1);
    let h2Id = SectionTitle.replace(/[\s!]/gi, '_').toLowerCase();
    const [sectionDots, setSectionDots] = _sectionDots;

    useEffect(() => {
        console.log('h2Id: ', h2Id)
        console.log('sectionDots: ', sectionDots)
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