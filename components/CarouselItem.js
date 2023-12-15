const CarouselItem = ({
  children,
  parentClassName = 'autoCarouselItem onLessonsPg mb-1 rounded p-1 justify-content-center align-items-center',
  secondChildDivClassName = 'px-1 pb-0 rounded w-100',
  thirdChildDivClassName = 'px-1 mediaItemContainer',
}) => {
  return (
    <div className={parentClassName}>
      <div className={secondChildDivClassName}>
        <div
          className={thirdChildDivClassName}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default CarouselItem;