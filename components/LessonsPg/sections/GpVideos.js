/* eslint-disable no-console */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
/* eslint-disable no-undef */
import VideoCard from "../VideoCard";
import Button from "../../General/Button";
import { useGetGpDataStates } from "../../../customHooks/useGetGpDataStates";

const GpVideos = ({
    startingGpVids,
    isLast,
    nextPgNumStartingVal,
    setIsModalShown,
    setSelectedVideo,
    totalVidsNum,
}) => {
    const { btnTxt, gpDataObj, handleOnClick } = useGetGpDataStates(startingGpVids, isLast, nextPgNumStartingVal, 'videos', totalVidsNum);

    return (
        <section className="lessonsSection pt-1">
            <div className='ms-sm-4 galactic-black  mb-2 mb-sm-4 text-left mt-4 mx-4'>
                <div className="d-flex">
                    <h4 className="d-flex justify-content-center align-items-center">
                        Galactic Polymath Videos
                    </h4>
                </div>
            </div>
            <div className='mx-auto grid pb-1 p-4 gap-3 pt-3 pb-5'>
                {gpDataObj.data?.length && (
                    (gpDataObj.data ?? startingGpVids).map(videoObj => {
                        return (
                            <VideoCard
                                key={videoObj.id}
                                setIsModalShown={setIsModalShown}
                                videoObj={videoObj}
                                setSelectedVideo={setSelectedVideo}
                            />
                        );
                    })
                )}
            </div>
            {!gpDataObj.isLast && (
                <div className='w-100 d-flex justify-content-center align-items-center pb-3'>
                    <Button
                        handleOnClick={handleOnClick}
                        backgroundColor="#E9EBEE"
                        fontSize={19}
                        classNameStr="text-center w-25 rounded no-btn-styles p-3 border"
                    >
                        {btnTxt}
                    </Button>
                </div>
            )}
        </section>
    );
};

export default GpVideos;