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

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

const useLessonElementInView = (_sectionDots, SectionTitle) => {
    const { ref, inView } = useInView({ threshold: .1 });
    const h2Id = SectionTitle.replace(/[\s!]/gi, '_').toLowerCase();
    const [sectionDots, setSectionDots] = _sectionDots;

    useEffect(() => {
        if (inView) {
            console.log('sectionDots hey there collapsible: ', sectionDots);
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

    return { ref, inView, h2Id }
}

export default useLessonElementInView;