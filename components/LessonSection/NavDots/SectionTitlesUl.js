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

const SectionTitlesUl = ({ sectionDots, willShowTitles, goToSection }) => {

    return (
        <>
            <ul className='ps-0 d-none d-lg-flex flex-column position-relative justify-content-center align-items-center h-100' style={{ transform: 'translate3d(0px, 0px, 0px)', 'transition-duration': '3500ms', transition: 'all .15s ease-in' }}>
                {sectionDots.map(({ isInView, SectionTitle, willShowTitle, sectionId }, index) => {
                    const isMaterialsTeachingSecId = sectionId === 'teaching_materials'
                    const liBorderColor = !isInView ? 'rgb(190, 190, 190)' : '#363636 1px solid !important'
                    const backgroundColor = isInView ? (isMaterialsTeachingSecId ? '#FEEAF8' : '#d5e6f3') : 'white'

                    return (
                        <div key={index}>
                            <li
                                className='d-none d-lg-inline-flex justify-content-end'
                                role='button'
                                style={{ opacity: willShowTitles ? 1 : 0, transition: "all .15s ease-in", height: "30px", 'width': '200px', transitionProperty: 'border-color, opacity' }}
                            >
                                <span style={{ transition: "all .15s ease-in", backgroundColor: backgroundColor, border: '#363636 1px solid', transitionProperty: 'border, background-color, opacity', fontWeight: 400, padding: 6 }} className='text-black  text-nowrap shadow rounded d-lg-inline-flex justify-content-center align-items-center d-none'>
                                    {SectionTitle}
                                </span>
                            </li>
                            <li
                                className='d-lg-none d-inline-flex justify-content-end position-relative'
                                role='button'
                                style={{ border: 'none', opacity: willShowTitle ? 1 : 0, transition: "all .15s ease-in", height: "30px", 'width': '200px', transitionProperty: 'border-color, display', zIndex: willShowTitle ? 100 : -1 }}
                            >
                                <span
                                    style={{ transition: "all .15s ease-in", backgroundColor: backgroundColor, border: '#363636 1px solid', transitionProperty: 'background-color, opacity, border', fontWeight: 400, padding: 6 }}
                                    className='text-black text-nowrap shadow rounded d-inline-flex d-lg-none justify-content-center align-items-center'
                                    onClick={_ => goToSection(sectionId, true)}
                                >
                                    {SectionTitle}
                                </span>
                            </li>
                        </div>
                    )
                })}
            </ul>
            <ul className='ps-0 d-flex d-lg-none flex-column position-relative justify-content-center align-items-center h-100' style={{ transform: 'translate3d(0px, 0px, 0px)', 'transition-duration': '3500ms', transition: 'all .15s ease-in' }}>
                {sectionDots.map(({ isInView, SectionTitle, willShowTitle, sectionId }, index) => {
                    console.log('sectionId: ', sectionId)
                    const isMaterialsTeachingSecId = sectionId === 'teaching_materials'
                    const liBorderColor = !isInView ? 'rgb(190, 190, 190)' : '#363636 1px solid !important'
                    const backgroundColor = isInView ? (isMaterialsTeachingSecId ? '#FEEAF8' : '#d5e6f3') : 'white'

                    return (
                        <div style={{ display: willShowTitles ? 'block' : 'none' }} key={index}>
                            <li
                                className='d-none d-lg-inline-flex justify-content-end'
                                role='button'
                                style={{ borderColor: liBorderColor, opacity: willShowTitles ? 1 : 0, transition: "all .15s ease-in", height: "30px", 'width': '200px', transitionProperty: 'border-color, opacity' }}
                            >
                                <span style={{ transition: "all .15s ease-in", backgroundColor: backgroundColor, border: '#363636 1px solid', transitionProperty: 'border, background-color, opacity', fontWeight: 400, padding: 6 }} className='text-black  text-nowrap shadow rounded d-lg-inline-flex justify-content-center align-items-center d-none'>
                                    {SectionTitle}
                                </span>
                            </li>
                            <li
                                className='d-lg-none d-inline-flex justify-content-end position-relative'
                                role='button'
                                style={{ border: 'none', opacity: willShowTitle ? 1 : 0, transition: "all .15s ease-in", height: "30px", 'width': '200px', transitionProperty: 'border-color, display', zIndex: willShowTitle ? 100 : -1 }}
                            >
                                <span
                                    style={{ transition: "all .15s ease-in", backgroundColor: backgroundColor, border: '#363636 1px solid', transitionProperty: 'background-color, opacity, border', fontWeight: 400, padding: 6 }}
                                    className='text-black text-nowrap shadow rounded d-inline-flex d-lg-none justify-content-center align-items-center'
                                    onClick={_ => goToSection(sectionId, true)}
                                >
                                    {SectionTitle}
                                </span>
                            </li>
                        </div>
                    )
                })}
            </ul>
        </>
    )
};

export default SectionTitlesUl;