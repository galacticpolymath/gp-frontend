/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
/* eslint-disable no-multiple-empty-lines */
import { IoIosLink } from 'react-icons/io';

const ForLessonTxt = ({
    Icon = <IoIosLink />,
    lessonNum,
    unitTitle,
}) => (
    <>
        {Icon}
        For Lesson {lessonNum} of <em>{unitTitle}</em>
    </>
);

export default ForLessonTxt;