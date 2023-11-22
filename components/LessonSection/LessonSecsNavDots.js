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
import { useRouter } from "next/router";
import LiNavDot from "./NavDots/LiNavDot";
import { useState } from "react";
import { useEffect } from "react";

const LessonsSecsNavDots = ({ _sectionDots, setIsScrollListenerOn, isScrollListenerOn }) => {
    const [sectionDots, setSectionDots] = _sectionDots;
    const router = useRouter();

    const handleMouseEnter = () => {
        setSectionDots(sectionDots => {
            return {
                ...sectionDots,
                dots: sectionDots.dots.map(sectionDot => {
                    return {
                        ...sectionDot,
                        willShowTitle: true,
                    }
                }),
            };
        });
    };

    const handleMouseLeave = () => {
        setSectionDots(sectionDots => {
            return {
                ...sectionDots,
                dots: sectionDots.dots.map(sectionDot => {
                    return {
                        ...sectionDot,
                        willShowTitle: false,
                    }
                }),
            }
        });
    };

    const [targetSec, setTargetSec] = useState(null);

    const scrollSectionIntoView = sectionId => {
        const targetSection = document.getElementById(sectionId);
        let url = router.asPath;

        if (targetSection) {
            (url.indexOf("#") !== -1) && router.replace(url.split("#")[0]);
            setTargetSec({ element: targetSection, id: sectionId })
        }
    }

    useEffect(() => {
        if (targetSec) {
            targetSec.element.scrollIntoView({ behavior: 'smooth', block: (targetSec.id === "lessonTitleId") ? 'center' : 'start' });
            setTargetSec(null)
        }
    }, [targetSec])

    const [willScrollElemIntoView, setWillScrollElemIntoView] = useState(false);
    let timerForHandleDotClick;

    const handleDotClick = sectionId => {
        clearTimeout(timerForHandleDotClick)
        timerForHandleDotClick = setTimeout(() => {
            setSectionDots(sectionDots => ({
                clickedSectionId: sectionId,
                dots: sectionDots.dots.map(dot => {
                    if (dot.sectionDotId === `sectionDot-${sectionId}`) {
                        return {
                            ...dot,
                            isInView: true,
                        }
                    }

                    return {
                        ...dot,
                        isInView: false,
                    }
                }),
            }))
            setIsScrollListenerOn(true);
        }, 950)
        setIsScrollListenerOn(false);
        setWillScrollElemIntoView(true);
        setSectionDots(sectionDots => {
            return {
                ...sectionDots,
                clickedSectionId: sectionId,
                dots: sectionDots.dots.map(sectionDot => {
                    return {
                        ...sectionDot,
                        willShowTitle: true,
                    }
                }),
            };
        });
    }

    let timerForGoToSectionFn;

    const goToSection = sectionId => {
        clearTimeout(timerForGoToSectionFn)
        timerForGoToSectionFn = setTimeout(() => {
            setSectionDots(sectionDots => ({
                clickedSectionId: sectionId,
                dots: sectionDots.dots.map(dot => {
                    if (dot.sectionDotId === `sectionDot-${sectionId}`) {
                        return {
                            ...dot,
                            isInView: true,
                        }
                    }

                    return {
                        ...dot,
                        isInView: false,
                    }
                }),
            }))
            setIsScrollListenerOn(true)
        }, 950)
        setIsScrollListenerOn(false)
        setWillScrollElemIntoView(true);
        setSectionDots(sectionDots => ({
            clickedSectionId: sectionId,
            dots: sectionDots.dots.map(dot => {
                if (dot.sectionDotId === `sectionDot-${sectionId}`) {
                    return {
                        ...dot,
                        isInView: true,
                    };
                }

                return {
                    ...dot,
                    isInView: false,
                };
            }),
        }));
    };

    useEffect(() => {
        if (willScrollElemIntoView) {
            scrollSectionIntoView(sectionDots.clickedSectionId)
            setWillScrollElemIntoView(false)
        }
    }, [willScrollElemIntoView, isScrollListenerOn])

    const liNavDotFns = { goToSection, handleDotClick, setSectionDots }

    return (
        <div
            style={{ transform: 'translateY(8%)' }}
            className="position-fixed lessonSecsNavDotsListContainer d-flex"
        >
            <ul
                onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
                className='ps-0 d-none d-lg-flex flex-column position-relative justify-content-center align-items-center h-100'
                style={{ transform: 'translate3d(0px, 0px, 0px)', transitionDuration: '3500ms', transition: 'all .15s ease-in' }}>
                {sectionDots.dots.map((section, index) => (
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
                {sectionDots.dots.map((section, index) => (
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