/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-indent-props */
 
import LessonSection from './index';

const ParentLessonSection = ({ section, index, _sectionDots, ForGrades }) => {
    return (
        <LessonSection
            index={index + 1}
            section={section}
            ForGrades={ForGrades}
            _sectionDots={_sectionDots}
        />
    );
};

export default ParentLessonSection;