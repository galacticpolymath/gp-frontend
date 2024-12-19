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
import ReactLoading from "react-loading";

const GpVideos = ({
    startingGpVids,
    isLast,
    nextPgNumStartingVal,
    setIsGpVideoModalShown,
    setSelectedVideo,
    totalVidsNum,
}) => {
    const { btnTxt, gpDataObj, handleOnClick } = useGetGpDataStates(
        startingGpVids,
        isLast,
        nextPgNumStartingVal,
        "videos",
        totalVidsNum
    );

    return (
        <section className="lessonsSection lessons-section-border-top pt-1 mb-2">
            <div className="ms-sm-4 galactic-black mb-2 text-left mt-4 mx-4">
                <div className="d-flex">
                    <span className="d-inline-flex justify-content-center align-items-center">
                        <i
                            style={{ color: "red", fontSize: 75 }}
                            className="bi bi-youtube"
                        />
                    </span>
                    <h4
                        id="gp-videos"
                        style={{ scrollMarginTop: "100px" }}
                        className="d-flex justify-content-center align-items-center ms-3"
                    >
                        Galactic Polymath Videos
                    </h4>
                </div>
                <div>
                    <a href="https://www.youtube.com/@galacticpolymath/videos">
                        View on our YouTube Channel{" "}
                        <i className="bi bi-box-arrow-up-right"></i>
                    </a>
                </div>
            </div>
            <div
                className={`${gpDataObj.data?.length ? "grid gap-3" : ""
                    } mx-auto pb-1 p-4 pt-3 pb-5`}
            >
                {gpDataObj.data?.length ? (
                    (gpDataObj.data ?? startingGpVids).map((videoObj) => {
                        return (
                            <VideoCard
                                key={videoObj.id}
                                setIsGpVideoModalShown={setIsGpVideoModalShown}
                                videoObj={videoObj}
                                setSelectedVideo={setSelectedVideo}
                            />
                        );
                    })
                ) : (
                    <div className="pb-4">
                        <p className="text-center text-sm-start">
                            An error has occurred. Couldn&apos;t retrieve videos. Please try
                            again by refreshing the page.
                        </p>
                    </div>
                )}
            </div>
            {gpDataObj.data?.length && !gpDataObj.isLast && (
                <SeeMoreBtnSec btnTxt={btnTxt} handleOnClick={handleOnClick}>
                    {btnTxt === "Loading" ? (
                        <span
                            style={{ height: 25 }}
                            className="d-inline-flex justify-content-center align-items-center w-100 position-relative"
                        >
                            <ReactLoading
                                type="bubbles"
                                color="#444444"
                                className="loading-bubbles"
                            />
                        </span>
                    ) : (
                        <span className="d-inline-flex w-100 h-100 justify-content-center">
                            {btnTxt}
                        </span>
                    )}
                </SeeMoreBtnSec>
            )}
        </section>
    );
};

export default GpVideos;
