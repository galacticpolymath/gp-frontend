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

import { useMemo, useState } from "react";
import { getIconStyles } from "../../../helperFns/getIconStyles";

const LiNavDot = ({ sectionTitle, fns, index, isOnDesktop }) => {
    const { isInView, sectionId, SectionTitle: title } = sectionTitle;
    const [willChangeIconColor, setWillChangeIconColor] = useState(false)
    const { goToSection, handleDotClick } = fns;

    const handleMouseOverIcon = () => {
        setWillChangeIconColor(true);
    }

    const handleMouseLeaveIcon = () => {
        setWillChangeIconColor(false);
    }

    const iconStyles = useMemo(() => getIconStyles((isInView || willChangeIconColor), sectionId), [willChangeIconColor, isInView, sectionId]);

    // show the section titles when the user hovers over the ul

    return (
        <>
            {isOnDesktop ?
                <li
                    key={index}
                    style={{ height: "30px" }}
                    role='button'
                    onClick={_ => goToSection(sectionId)}
                    className='d-flex flex-inline justify-content-center align-items-center position-relative'
                >
                    <i
                        onMouseOver={handleMouseOverIcon}
                        onMouseLeave={handleMouseLeaveIcon}
                        style={iconStyles} />
                    <div style={{ width: 'auto', right: '25px' }} className='p-1 bg-white rounded position-absolute d-flex'>
                        <span className='text-nowrap'>{title}</span>
                        <span style={{ width: 55 }} className='d-flex d-md-none justify-content-center align-items-center ps-1 sectionTitleSpan'>
                            <span className="dotLine" />
                        </span>
                    </div>
                </li>
                :
                <li
                    key={index}
                    style={{ height: "30px" }}
                    role='button'
                    className='d-flex flex-inline justify-content-center align-items-center sectionNavDotLi'
                >
                    <i
                        onClick={_ => handleDotClick(sectionId, true)}
                        className='sectionNavDot'
                        style={iconStyles} />
                </li>
            }
        </>
    )

}

export default LiNavDot;