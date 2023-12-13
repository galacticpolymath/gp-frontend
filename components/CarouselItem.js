
const CarouselItem = ({
    children,
    parentStyles = "autoCarouselItem onLessonsPg mb-1 rounded p-1 justify-content-center align-items-center",
    secondChildDivClassName = "px-1 pb-0 rounded w-100",
    thirdChildDivClassName = "px-1 mediaItemContainer"
}) => {
    return (
        <div className={"autoCarouselItem onLessonsPg mb-1 rounded p-1 justify-content-center align-items-center"}>
            <div className={"px-1 pb-0 rounded w-100"}>
                <div
                    className={"px-1 mediaItemContainer"}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};

export default CarouselItem;