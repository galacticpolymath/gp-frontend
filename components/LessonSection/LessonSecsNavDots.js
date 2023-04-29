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

const LessonsSecsNavDots = ({ _sectionDots, setTargetSectionId }) => {
    const [sectionDots, setSectionDots] = _sectionDots;
    const [willRerender, setWillRerender] = useState(false);
    const router = useRouter();

    useEffect(() => {
        console.log('comp LessonsSecsNavDots: ', willRerender)
        setWillRerender(willRerender => !willRerender)
    }, [])

    const handleMouseEnter = () => {
        setSectionDots(sectionDots => {
            return {
                ...sectionDots,
                dots: sectionDots.dots.map(sectionDot => {
                    return {
                        ...sectionDot,
                        willShowTitle: true,
                    }
                })
            }
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
                })
            }
        });
    };

    const [targetSec, setTargetSec] = useState(null)

    const scrollSectionIntoView = sectionId => {
        console.log('will scroll into view the target section')
        console.log("scrolling section into view: ", sectionId)
        const targetSection = document.getElementById(sectionId);
        let url = router.asPath;
        

        if (targetSection) {
            (url.indexOf("#") !== -1) && router.replace(url.split("#")[0]);
            console.log('sectionId: ', sectionId)
            setSectionDots(sectionDots => ({ ...sectionDots, clickedSectionId: sectionId }))
            setTargetSec({ element: targetSection, id: sectionId })
            setTargetSectionId(sectionId)
        }
    }

    useEffect(() => {
        if(targetSec){
            targetSec.element.scrollIntoView({ behavior: 'smooth', block: (targetSec.id === "lessonTitleId") ? 'center' : 'start' });
            setTargetSec(null)
        }
    }, [targetSec])

    const handleDotClick = sectionId => {
        // setSectionDots(sectionDots => {
        //     return {
        //         ...sectionDots,
        //         dots: sectionDots.dots.map(sectionDot => {
        //             return {
        //                 ...sectionDot,
        //                 willShowTitle: false,
        //             }
        //         })
        //     }
        // });
        scrollSectionIntoView(sectionId);
    }

    const goToSection = sectionId => {
        console.log("target section that was clicked, id: ", sectionId)
        scrollSectionIntoView(sectionId);
    }

    const liNavDotFns = { goToSection, handleDotClick, setSectionDots }

    return (
            <div style={{ transform: 'translateY(17%)' }} className="position-fixed lessonSecsNavDotsListContainer d-flex">
                <ul onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className='ps-0 d-none d-lg-flex flex-column position-relative justify-content-center align-items-center h-100' style={{ transform: 'translate3d(0px, 0px, 0px)', 'transitionDuration': '3500ms', transition: 'all .15s ease-in' }}>
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