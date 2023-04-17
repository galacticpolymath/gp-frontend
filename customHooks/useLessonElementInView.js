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

const useLessonElementInView = (_sectionDots, SectionTitle, ref) => {
    const { inViewport: inView } = useInViewport(ref);    
    let h2Id = SectionTitle.replace(/[\s!]/gi, '_').toLowerCase();
    const [sectionDots, setSectionDots] = _sectionDots;
    const [wasRendered, setWasRendered] = useState(false);

    useEffect(()=> {
        setTimeout(() => {
            setWasRendered(true);
        }, 1500)
    }, [])

    useEffect(() => {
        console.log('inView: ', inView)
        console.log('h2Id: ', h2Id)
        if (inView && wasRendered) {
            console.log('h2Id: ', h2Id)
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

    return { inView, h2Id: h2Id }
}

export default useLessonElementInView;