/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable quotes */
import LessonSection, { NUMBERED_SECTIONS } from './index';

const ParentLessonSection = ({ section, index, _sectionDots }) => {
    const [sectionDots, setSectionDots] = _sectionDots;

    return (
        <LessonSection
            index={index + 1}
            section={section}
            setSectionDots={setSectionDots}
        />
    );
};

export default ParentLessonSection;