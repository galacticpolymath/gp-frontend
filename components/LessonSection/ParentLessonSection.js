/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable quotes */
import LessonSection, { NUMBERED_SECTIONS } from './index';

const ParentLessonSection = ({ section, index, _sectionDots, _wasDotClicked, setIsScrollListenerOn, _isScrollListenerOn }) => {
    return (
        <LessonSection
            index={index + 1}
            section={section}
            _sectionDots={_sectionDots}
            _wasDotClicked={_wasDotClicked}
            setIsScrollListenerOn={setIsScrollListenerOn}
            _isScrollListenerOn={_isScrollListenerOn}
        />
    );
};

export default ParentLessonSection;