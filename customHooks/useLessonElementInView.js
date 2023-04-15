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
    console.log('SectionTitle: ', SectionTitle)
    let h2Id = SectionTitle.replace(/[\s!]/gi, '_').toLowerCase();
    console.log('h2Id: ', h2Id)
    const [sectionDots, setSectionDots] = _sectionDots;

    // if the isAvailLocsMoreThan1 is true and the hook is being invoked in the acknowledgments section or the versions section, then h2Id needs to be heading_acknowledgments or heading_versions, 

    useEffect(() => {
        console.log('sectionDots: ', sectionDots)
        console.log('h2Id: ', h2Id);
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