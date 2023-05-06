/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable quotes */
import LessonSection from './index';

const ParentLessonSection = ({ section, index, _sectionDots, oldLesson }) => {
    return (
        <LessonSection
            index={index + 1}
            section={section}
            _sectionDots={_sectionDots}
            oldLesson={oldLesson}
        />
    );
};

export default ParentLessonSection;