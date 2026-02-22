import { IoIosLink } from 'react-icons/io';
import type { ReactNode } from 'react';

interface ForLessonTxtWrapperProps {
  Icon?: ReactNode;
  children: ReactNode;
}

const ForLessonTxtWrapper = ({
  Icon = <IoIosLink />,
  children,
}: ForLessonTxtWrapperProps) => (
  <>
    <div style={{ paddingTop: 4 }} className='d-flex justify-content-center'>
      {Icon}
    </div>
    <div className='d-flex justify-content-center ps-1'>
      <span className='for-lesson-text-test'>{children}</span>
    </div>
  </>
);

export default ForLessonTxtWrapper;
