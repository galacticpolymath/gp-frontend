import Link from 'next/link';

const LessonCardWrapper = ({
  children,
  href = '',
  _id = '',
  style = {},
  linkClassName = 'w-100 pointer disable-underline-a-tags g-col-sm-12 g-col-md-6 g-col-lg-6 g-col-xl-4 mx-auto d-grid p-3 bg-white rounded-3 lessonsPgShadow cardsOnLessonPg',
}) => (
  <Link
    style={style}
    key={_id}
    href={href}
    className={linkClassName}
  >
    {children}
  </Link>
);
export default LessonCardWrapper;
