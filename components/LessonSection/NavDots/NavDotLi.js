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

const NavDotLi = ({ index, isInView, SectionTitle, sectionId, setSectionDots, willShowTitle }) => {
    const iconStyles = { backgroundColor: isInView ? 'rgba(44, 131, 195, 0.6)' : '', height: '10px', width: '10px', borderRadius: '50%', display: 'inline-block', margin: '0 5px', border: '2px solid #bebebe', borderColor: isInView ? '#2c83c3' : 'rgb(190, 190, 190)', padding: '4px', opacity: 1, transition: "all .15s ease-in", transitionProperty: "background-color, border-color" }

    const handleLiClick = isOnMobile => {
        if(isOnMobile){
            setSectionDots(sectionDots => sectionDots.map(sectionDot => {
                    return {
                        ...sectionDot,
                        willShowTitle: false,
                    }
                })
            );
        }

        const targetSection = document.getElementById(sectionId);

        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    const handleDotClick = () => {
        setSectionDots(sectionDots => sectionDots.map(sectionDot => {
                const { sectionId: _sectionId, willShowTitle } = sectionDot;
                
                if(_sectionId === sectionId){
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

    return (
        <>
            <li
                key={index}
                className='d-none d-md-inline-flex justify-content-end'
                role='button'
                onClick={_ => handleLiClick()}
                style={{ border: 'none', borderColor: !isInView ? 'rgb(190, 190, 190)' : '', transition: "background-color .15s ease-in", 'width': '200px' }}
            >
                <section className='d-flex justify-content-center align-items-center'>
                    <span className='text-black text-nowrap bg-white shadow p-1 rounded'>{SectionTitle}</span>
                </section>
                <section className='d-flex justify-content-center align-items-center'>
                    <i
                        style={iconStyles}
                    />
                </section>
            </li>
            <li
                key={index}
                className='d-inline-flex d-md-none justify-content-end'
                role='button'
                style={{ border: 'none', borderColor: !isInView ? 'rgb(190, 190, 190)' : '', transition: "background-color .15s ease-in", 'width': '200px' }}
            >
                <section className='d-flex justify-content-center align-items-center'>
                    <span onClick={_ => handleLiClick(true)} style={{ opacity: willShowTitle ? 1 : 0 }} className='text-black text-nowrap bg-white shadow p-1 rounded'>{SectionTitle}</span>
                </section>
                <section className='d-flex justify-content-center align-items-center'>
                    <i
                        onClick={handleDotClick}
                        style={iconStyles}
                    />
                </section>
            </li>
        </>
    );
}

export default NavDotLi;
