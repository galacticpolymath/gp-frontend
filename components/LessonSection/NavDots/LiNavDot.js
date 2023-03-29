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

import { useEffect, useMemo, useState } from "react";
import { v4 } from "uuid";

const LiNavDot = ({ isInView, sectionId, fns, index, isOnDesktop }) => {
    const [willChangeIconColor, setWillChangeIconColor] = useState(false)
    const { goToSection, handleDotClick } = fns;

    const handleMouseOverIcon = () => {
        setWillChangeIconColor(true);
    }

    const handleMouseLeaveIcon = () => {
        setWillChangeIconColor(false);
    }

    const getIconStyles = _ => {
        const isTeachingMaterialsId = sectionId === 'teaching_materials';
        const bgColor = (isInView || willChangeIconColor) ? (isTeachingMaterialsId ? '#cb1f8e' : 'rgba(44, 131, 195, 0.6)') : 'rgba(0,0,0,.1)';
        const borderColor = (isInView || willChangeIconColor) ? (isTeachingMaterialsId ? '#cb1f8e' : '#2c83c3') : (isTeachingMaterialsId ? '#cb1f8e' : '#bebebe');

        return (
            {
                backgroundColor: bgColor, height: '10px', width: '10px', borderRadius: '50%', display: 'inline-block', margin: '0 5px', border: '2px solid', borderColor: borderColor, padding: '4px', opacity: 1, transition: "all .15s ease-in", transitionProperty: "background-color, border-color",
            }
        )
    }
    const iconStyles = useMemo(() => getIconStyles(), [willChangeIconColor, isInView, sectionId]);

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
                        style={iconStyles} />
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
                        style={iconStyles} />
                </li>
            }
        </>
    )

}

export default LiNavDot;