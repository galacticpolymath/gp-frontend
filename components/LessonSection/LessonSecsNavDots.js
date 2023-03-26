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

import { useState } from "react";
import NavDotLi from "./NavDots/NavDotLi";

const LessonsSecsNavDots = ({ _sectionDots }) => {
    const [sectionDots, setSectionDots] = _sectionDots;
    const [willShowTitles, setWillShowTitles] = useState(false);
    const [willChangeIconColor, setWillChangeIconColor] = useState(false);
    // const iconStyles = { backgroundColor: isInView ? 'rgba(44, 131, 195, 0.6)' : '', height: '10px', width: '10px', borderRadius: '50%', display: 'inline-block', margin: '0 5px', border: '2px solid #bebebe', borderColor: isInView ? '#2c83c3' : 'rgb(190, 190, 190)', padding: '4px', opacity: 1, transition: "all .15s ease-in", transitionProperty: "background-color, border-color" }

    const getIconStyles = isInView => ({ backgroundColor: isInView || willChangeIconColor ? 'rgba(44, 131, 195, 0.6)' : '', height: '10px', width: '10px', borderRadius: '50%', display: 'inline-block', margin: '0 5px', border: '2px solid #bebebe', borderColor: isInView || willChangeIconColor ? '#2c83c3' : 'rgb(190, 190, 190)', padding: '4px', opacity: 1, transition: "all .15s ease-in", transitionProperty: "background-color, border-color" })

    const handleMouseEnterIconList = () => {
        setWillShowTitles(true);
    };

    const handleMouseLeaveIconList = () => {
        setWillShowTitles(false);
    };

    const handleMouseOverIcon = () => {
        setWillChangeIconColor(true);
    }

    const handleMouseLeaveIcon = () => {
        setWillChangeIconColor(false);
    }

    const handleDotClick = sectionId => {
        setSectionDots(sectionDots => sectionDots.map(sectionDot => {
            const { sectionId: _sectionId, willShowTitle } = sectionDot;

            if (_sectionId === sectionId) {
                return {
                    ...sectionDot,
                    willShowTitle: !willShowTitle,
                }
            }

            return {
                ...sectionDot,
                willShowTitle: false,
            }
        })
        );
    }

    const goToSection = (sectionId, isOnMobile) => {
        if (isOnMobile) {
            setSectionDots(sectionDots => sectionDots.map(sectionDot => {
                return {
                    ...sectionDot,
                    willShowSecOnMobile: false,
                }
            }));
        }

        const targetSection = document.getElementById(sectionId);

        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    return (
        <div className="position-fixed lessonSecsNavDotsListContainer d-flex">
            <ul className='ps-0 mb-0 d-flex flex-column position-relative justify-content-center align-items-center h-100' style={{ transform: 'translate3d(0px, 0px, 0px)', 'transition-duration': '3500ms', transition: 'all .15s ease-in' }}>
                {sectionDots.map(({ isInView, SectionTitle, willShowSecOnMobile }, index) => (
                    <li
                        className='d-none d-lg-inline-flex justify-content-end'
                        role='button'
                        style={{ border: 'none', borderColor: !isInView ? 'rgb(190, 190, 190)' : '', opacity: willShowTitles ? 1 : 0, transition: "all .15s ease-in", 'width': '200px', transitionProperty: 'border-color, opacity' }}
                    >
                        <span style={{ transition: "all .15s ease-in", backgroundColor: isInView ? '#d5e6f3' : 'white', border: isInView ? '#363636 1px solid' : 'none', transitionProperty: 'border, background-color, opacity', fontWeight: 400, padding: 6 }} className='text-black text-nowrap shadow rounded d-lg-inline d-none'>{SectionTitle}</span>
                        <span
                            style={{ transition: "all .15s ease-in", backgroundColor: isInView ? '#d5e6f3' : 'white', border: isInView ? '#363636 1px solid' : 'none', transitionProperty: 'border, background-color, opacity', fontWeight: 400, padding: 6, opacity: willShowSecOnMobile ? 1 : 0 }}
                            className='text-black text-nowrap shadow rounded d-inline d-lg-none'
                            onClick={_ => goToSection(sectionId, true)}
                        >
                            {SectionTitle}
                        </span>
                    </li>
                ))}
            </ul>
            <ul onMouseEnter={handleMouseEnterIconList} onMouseLeave={handleMouseLeaveIconList} className='ps-0 mb-0 d-none d-lg-flex flex-column position-relative justify-content-center align-items-center h-100' style={{ transform: 'translate3d(0px, 0px, 0px)', 'transition-duration': '3500ms', transition: 'all .15s ease-in' }}>
                {sectionDots.map(({ isInView, SectionTitle, sectionId, willShowTitle }, index) => (
                    <li
                        key={index}
                        style={{ height: 39.1 }}
                        role='button'
                        onClick={_ => goToSection(sectionId)}
                        className='d-flex flex-inline justify-content-center align-items-center'
                    >
                        <i
                            onMouseOver={handleMouseOverIcon}
                            onMouseLeave={handleMouseLeaveIcon}
                            style={getIconStyles(isInView)}
                        />
                    </li>
                ))}
            </ul>
            <ul className='ps-0 mb-0 d-flex d-lg-none flex-column position-relative justify-content-center align-items-center h-100' style={{ transform: 'translate3d(0px, 0px, 0px)', 'transition-duration': '3500ms', transition: 'all .15s ease-in' }}>
                {sectionDots.map(({ isInView, sectionId }, index) => (
                    <li
                        key={index}
                        style={{ height: 39.1 }}
                        role='button'
                        onClick={_ => handleDotClick(sectionId)}
                        className='d-flex flex-inline justify-content-center align-items-center'
                    >
                        <i
                            onMouseOver={handleMouseOverIcon}
                            onMouseLeave={handleMouseLeaveIcon}
                            style={getIconStyles(isInView)}
                        />
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default LessonsSecsNavDots;