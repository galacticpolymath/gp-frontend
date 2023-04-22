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
import { useInView } from 'react-intersection-observer';

const useLessonElementInView = (_sectionDots, SectionTitle) => {
    const { ref, inView, entry } = useInView({
        threshold: .1,
      });
    let h2Id = SectionTitle.replace(/[\s!]/gi, '_').toLowerCase();
    const [, setSectionDots] = _sectionDots;
    const [wasRendered, setWasRendered] = useState(false);

    useEffect(() => {
        setWasRendered(true);
    }, [])

    useEffect(() => {
        console.log('entry: ', entry)
        if (inView && wasRendered) {
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
    }, [inView, wasRendered]);

    return { inView, h2Id, ref, entry }
}

export default useLessonElementInView;