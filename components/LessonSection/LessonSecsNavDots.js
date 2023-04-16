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

const LessonsSecsNavDots = ({ _sectionDots }) => {
    const [sectionDots, setSectionDots] = _sectionDots;
    const router = useRouter();

    const handleMouseEnter = () => {
        setSectionDots(sectionDots => sectionDots.map(sectionDot => {
            return {
                ...sectionDot,
                willShowTitle: true,
            }
        }));
    };

    const handleMouseLeave = () => {
        setSectionDots(sectionDots => sectionDots.map(sectionDot => {
            return {
                ...sectionDot,
                willShowTitle: false,
            }
        }));
    };

    const scrollSectionIntoView = sectionId => {
        const targetSection = document.getElementById(sectionId);
        let url = router.asPath;
        
        if(targetSection){
            (url.indexOf("#") !== -1) && router.replace(url.split("#")[0]);
            targetSection.scrollIntoView({ behavior: 'smooth', block: (sectionId === "lessonTitleId") ? 'center' : 'start' });
        }
    }

    const handleDotClick = sectionId => {
        setSectionDots(sectionDots => sectionDots.map(sectionDot => {
            return {
                ...sectionDot,
                willShowTitle: true,
            }
        }));
        scrollSectionIntoView(sectionId);
    }

    const goToSection = sectionId => {
        scrollSectionIntoView(sectionId);
    }

    const liNavDotFns = { goToSection, handleDotClick, setSectionDots }

    return (
        <div className="position-fixed lessonSecsNavDotsListContainer d-flex">
            <ul onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className='ps-0 d-none d-lg-flex flex-column position-relative justify-content-center align-items-center h-100' style={{ transform: 'translate3d(0px, 0px, 0px)', 'transitionDuration': '3500ms', transition: 'all .15s ease-in' }}>
                {sectionDots.map((section, index) => (
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
                {sectionDots.map((section, index) => (
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