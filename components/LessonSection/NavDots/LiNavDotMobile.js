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
import { getIconStyles } from "../../../helperFns/getIconStyles";

const NAV_CLASSNAMES = ['sectionNavDotLi', 'sectionNavDot', 'sectionTitleParent', 'sectionTitleLi', 'sectionTitleSpan']

const LiNavDotMobile = ({ section, handleDotClick, index, setSectionDots }) => {
    const { isInView, sectionId, SectionTitle: title, willShowTitle } = section;
    const backgroundColor = isInView ? ((sectionId === 'teaching_materials') ? '#FEEAF8' : '#d5e6f3') : 'white'

    const iconStyles = useMemo(() => getIconStyles(isInView, sectionId), [isInView, sectionId]);

    const handleDocumentClick = event => {
        const wasANavDotElementClicked = NAV_CLASSNAMES.some(className => event.target.classList.contains(className))

        !wasANavDotElementClicked && setSectionDots(sectionDots => {
            if (sectionDots?.length) {
                return sectionDots.map(sectionDot => {
                    return {
                        ...sectionDot,
                        willShowTitle: false,
                    };
                })
            }

            return sectionDots;
        })
    }

    useEffect(() => {

        document.body.addEventListener('click', handleDocumentClick);

        return () => document.body.removeEventListener('click', handleDocumentClick);
    }, [])

    return (
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
            <div style={{ opacity: willShowTitle ? 1 : 0, width: 'auto', right: '18px', pointerEvents: 'none' }} className='position-absolute d-flex'>
                <span style={{ transition: "all .15s ease-in", backgroundColor: backgroundColor, border: '#363636 1px solid', transitionProperty: 'background-color, opacity, border' }} className='text-nowrap p-1 rounded'>{title}</span>
                <span style={{ width: 55 }} className='d-flex d-md-none justify-content-center align-items-center ps-1 sectionTitleSpan'>
                    <span className="dotLine" />
                </span>
            </div>
        </li>
    )

}

export default LiNavDotMobile;