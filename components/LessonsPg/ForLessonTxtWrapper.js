/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
 
import { IoIosLink } from 'react-icons/io';

const ForLessonTxtWrapper = ({
    Icon = <IoIosLink />,
    children: txt,
}) => (
    <>
        <div style={{ paddingTop: 4 }} className='d-flex justify-content-center'>
            {Icon}
        </div>
        <div className='d-flex justify-content-center ps-1'>
            <span className='for-lesson-text-test'>
                {txt}
            </span>
        </div>
    </>
);

export default ForLessonTxtWrapper;