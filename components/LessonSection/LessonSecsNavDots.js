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
import { useState, useEffect } from "react";
import ClickMeArrow from "../ClickMeArrow";
import throttle from "lodash.throttle";

const LessonsSecsNavDots = ({ _sectionDots, setIsScrollListenerOn, isScrollListenerOn }) => {
    const [sectionDots, setSectionDots] = _sectionDots;
    const [targetSec, setTargetSec] = useState(null);
    const [willScrollElemIntoView, setWillScrollElemIntoView] = useState(false);
    const [arrowContainer, setArrowContainer] = useState({ isInView: true, canTakeOffDom: false })
    const router = useRouter();

    const handleMouseEnter = () => {
        setArrowContainer({ isInView: false, canTakeOffDom: true });

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

    const scrollSectionIntoView = sectionId => {
        const targetSection = document.getElementById(sectionId);

        if (targetSection) {
            setTargetSec({ element: targetSection, id: sectionId })
        }
    }

    useEffect(() => {
        const overviewSection = sectionDots.dots.find(({ sectionTitleForDot }) => sectionTitleForDot.toLowerCase() === 'overview')

        if (!overviewSection.isInView && arrowContainer.isInView) {
            setArrowContainer({ isInView: false, canTakeOffDom: false })
        }
    }, [sectionDots])

    useEffect(() => {
        let url = router.asPath;

        if (targetSec && url.indexOf("#")) {
            targetSec.element.scrollIntoView({ behavior: 'smooth', block: (targetSec.id === "lessonTitleId") ? 'center' : 'start' });
            setTargetSec(null);
            window.history.replaceState(null, '', url.split("#")[0]);
        } else if (targetSec) {
            targetSec.element.scrollIntoView({ behavior: 'smooth', block: (targetSec.id === "lessonTitleId") ? 'center' : 'start' });
            setTargetSec(null);
        }
    }, [targetSec])

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
            setSectionDots(sectionDots => {
                return {
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
                }
            })
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
    let timer;

    // delete the arrow when the following occurs:
    // -when the user starts scrolling 
    // -when the user hovers over the dots
    const handleElementVisibility = inViewPort => (throttle(() => {
        clearTimeout(timer);

        if (inViewPort) {
            setArrowContainer(state => ({ ...state, isInView: true }));

            timer = setTimeout(() => {
                setArrowContainer(state => ({ ...state, isInView: false }));
            }, 3500);
        }
    }, 200))();

    return (
        <div
            style={{ transform: 'translateY(8%)' }}
            className="position-fixed lessonSecsNavDotsListContainer d-flex"
        >
            {/* for devices larger than 992px */}
            <ul
                onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
                className='ps-0 d-none d-lg-flex flex-column position-relative justify-content-center align-items-center h-100'
                style={{ transform: 'translate3d(0px, 0px, 0px)', transitionDuration: '3500ms', transition: 'all .15s ease-in' }}>
                {sectionDots.dots.map((section, index) => (
                    <LiNavDot
                        key={index}
                        EnticementArrow={(index === 0) ?
                            <ClickMeArrow
                                arrowTxt="Skip to Section"
                                handleElementVisibility={handleElementVisibility}
                                willShowArrow={arrowContainer.isInView}
                                containerStyle={{ zIndex: 1000, right: "40px", bottom: "65px", display: arrowContainer.canTakeOffDom ? 'none' : 'block' }}
                                clickToSeeMoreStyle={{ fontSize: 'clamp(17px, 2vw, 18px)', transform: 'translateY(10px)' }}
                            />
                            :
                            null
                        }
                        fns={liNavDotFns}
                        section={section}
                        index={index}
                        isOnDesktop
                    />
                ))}
            </ul>
            {/* for devices smaller than 991px */}
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