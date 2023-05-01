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
import { useEffect } from "react";

const LiNavDot = ({ section, fns, index, isOnDesktop }) => {
    const { isInView, sectionId, sectionTitleForDot: title, willShowTitle, sectionDotId } = section;

    // useEffect(() => {
    //     console.log('sectionDotId: ', sectionDotId)
    // })
    const [willChangeIconColor, setWillChangeIconColor] = useState(false)
    const { goToSection, handleDotClick } = fns;
    const backgroundColor = isInView ? (sectionId === '3._teaching_materials') ? '#FEEAF8' : '#d5e6f3' : 'white'

    const handleMouseOverIcon = () => {
        setWillChangeIconColor(true);
    }

    const handleMouseLeaveIcon = () => {
        setWillChangeIconColor(false);
    }

    const iconStyles = useMemo(() => getIconStyles((isInView || willChangeIconColor), sectionId), [willChangeIconColor, isInView, sectionId]);

    return (
        <>
            {isOnDesktop ?
                <li
                    key={index}
                    style={{ height: "33px" }}
                    role='button'
                    onClick={_ => {
                        console.log("sectionId that the user will go to: ", sectionId)
                        goToSection(sectionId)
                    }}
                    className='d-flex flex-inline justify-content-center align-items-center position-relative sectionNavDotLi'
                >
                    <i
                        onMouseOver={handleMouseOverIcon}
                        onMouseLeave={handleMouseLeaveIcon}
                        style={iconStyles}
                        // style={{
                        //     backgroundColor: 'rgba(0,0,0,.1)', height: '10px', width: '10px', borderRadius: '50%', display: 'inline-block', margin: '0 5px', border: '2px solid', borderColor: '#bebebe', padding: '4px', opacity: 1, transition: "all .15s ease-in", transitionProperty: "background-color, border-color",
                        // }}
                        // style={{
                        //     backgroundColor: isInView || 'rgba(0,0,0,.1)'
                        // }}
                        // onClick={_ => {
                        //     console.log("sectionId that the user will go to, i icon clicked: ", sectionId)
                        //     debugger
                        //     goToSection(sectionId)
                        // }}
                        className='sectionNavDot'
                        id={sectionDotId}
                    />
                    <div style={{ zIndex: 1100, opacity: willShowTitle ? 1 : 0, width: 'auto', right: '25px', transition: "all .15s ease-in", pointerEvents: 'none', backgroundColor: backgroundColor, border: '#363636 1px solid', transitionProperty: 'background-color, opacity, border' }} className='p-1 rounded position-absolute d-flex'>
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
                        style={iconStyles}
                        // style={{
                        //     backgroundColor: 'rgba(0,0,0,.1)', height: '10px', width: '10px', borderRadius: '50%', display: 'inline-block', margin: '0 5px', border: '2px solid', borderColor: '#bebebe', padding: '4px', opacity: 1, transition: "all .15s ease-in", transitionProperty: "background-color, border-color",
                        // }}
                        // style={{ backgroundColor: 'rgba(0,0,0,.1)', height: '10px', width: '10px', borderRadius: '50%', display: 'inline-block', margin: '0 5px', border: '2px solid', borderColor: '#bebebe', padding: '4px', opacity: 1, transition: "all .15s ease-in", transitionProperty: "background-color, border-color",}}
                        id={sectionDotId} 
                    />
                    <div style={{ opacity: willShowTitle ? 1 : 0, width: 'auto', right: '18px', pointerEvents: 'none', transition: "all .15s ease-in", transitionProperty: 'opacity' }} className='position-absolute d-flex'>
                        <span style={{ transition: "all .15s ease-in", backgroundColor: backgroundColor, border: '#363636 1px solid', transitionProperty: 'background-color, opacity, border' }} className='text-nowrap p-1 rounded'>{title}</span>
                        <span style={{ width: 55 }} className='d-flex d-md-none justify-content-center align-items-center ps-1 sectionTitleSpan'>
                            <span className="dotLine" />
                        </span>
                    </div>
                </li>
            }
        </>
    )

}

export default LiNavDot;