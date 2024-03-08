/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable no-console */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
/* eslint-disable no-undef */
import VideoCard from "../VideoCard";
import { useGetGpDataStates } from "../../../customHooks/useGetGpDataStates";
import SeeMoreBtnSec from "./SeeMoreBtnSec";
import ReactLoading from 'react-loading';

const GpVideos = ({
    startingGpVids,
    isLast,
    nextPgNumStartingVal,
    setIsGpVideoModalShown,
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
                                setIsGpVideoModalShown={setIsGpVideoModalShown}
                                videoObj={videoObj}
                                setSelectedVideo={setSelectedVideo}
                            />
                        );
                    })
                )}
            </div>
            {!gpDataObj.isLast && (
                <SeeMoreBtnSec
                    btnTxt={btnTxt}
                    handleOnClick={handleOnClick}
                >
                    {(btnTxt === 'Loading')
                        ?
                        <span style={{ height: 25 }} className='d-inline-flex justify-content-center align-items-center w-100 position-relative'>
                            <ReactLoading
                                type='bubbles'
                                color='#444444'
                                className='loading-bubbles'
                            />
                        </span>
                        :
                        <span className='d-inline-flex w-100 h-100 justify-content-center'>
                            {btnTxt}
                        </span>
                    }
                </SeeMoreBtnSec>
            )}
        </section>
    );
};

export default GpVideos;