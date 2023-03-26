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
import { useInView } from "react-intersection-observer";
import { useDetectScroll } from "@smakss/react-scroll-direction";
import { useRef } from "react";

const useLessonElementInView = (_sectionDots, SectionTitle) => {
    const { ref, inView } = useInView({ threshold: .1 });
    const customRef = useRef();
    const [scrollDir] = useDetectScroll({});
    const h2Id = SectionTitle.replace(/[\s!]/gi, '_').toLowerCase();
    const [sectionDots, setSectionDots] = _sectionDots;
    const [isScrolling, setIsScrolling] = useState(false);

    const handleScroll = () => {
        console.log("customRef: ", customRef)
        if(customRef?.current){
            const { top, bottom } = customRef.current.getBoundingClientRect();
            const isElementInView = (top >= 0) && (bottom <= window.innerHeight);
            console.log("isElementInView: ", isElementInView)
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

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

    return { ref, inView, h2Id: h2Id, customRef }
}

export default useLessonElementInView;