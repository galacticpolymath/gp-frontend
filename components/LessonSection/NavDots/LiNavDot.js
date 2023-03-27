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

import { useEffect, useState } from "react";
import { v4 } from "uuid";

const LiNavDot = ({ isInView, sectionId, fns, index, isOnDesktop }) => {
    const [willChangeIconColor, setWillChangeIconColor] = useState(false)
    const [willGetIconStyles, setWillGetIconStyles] = useState(false)
    const { goToSection, handleDotClick } = fns;

    const handleMouseOverIcon = () => {
        setWillChangeIconColor(true);
    }

    const handleMouseLeaveIcon = () => {
        setWillChangeIconColor(false);
    }

    const getIconStyles = willChangeIconColor => ({ backgroundColor: isInView || willChangeIconColor ? 'rgba(44, 131, 195, 0.6)' : '', height: '10px', width: '10px', borderRadius: '50%', display: 'inline-block', margin: '0 5px', border: '2px solid #bebebe', borderColor: isInView || willChangeIconColor ? '#2c83c3' : 'rgb(190, 190, 190)', padding: '4px', opacity: 1, transition: "all .15s ease-in", transitionProperty: "background-color, border-color" })

    useEffect(() => {
        setWillGetIconStyles(true);
    }, [])

    return (
        <>
            {isOnDesktop ?
                <li
                    key={index}
                    style={{ height: "30px" }}
                    role='button'
                    onClick={_ => goToSection(sectionId)}
                    className='d-flex flex-inline justify-content-center align-items-center'
                >
                    <i
                        onMouseOver={handleMouseOverIcon}
                        onMouseLeave={handleMouseLeaveIcon}
                        style={willGetIconStyles ? getIconStyles(willChangeIconColor) : {}} />
                </li>
                :
                <li
                    key={index}
                    style={{ height: "30px" }}
                    role='button'
                    className='d-flex flex-inline justify-content-center align-items-center'
                >
                    <i
                        onClick={_ => handleDotClick(sectionId, true)}
                        style={willGetIconStyles ? getIconStyles(willChangeIconColor) : {}} />
                </li>
            }
        </>
    )

}

export default LiNavDot;