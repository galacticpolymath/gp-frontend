/* eslint-disable quotes */
 
import VideoCard from "../VideoCard";
import { useGetGpDataStates } from "../../../customHooks/useGetGpDataStates";
import SeeMoreBtnSec from "./SeeMoreBtnSec";
import { Spinner } from "react-bootstrap";
import React from "react";
import {
  IGpUnitsItemsPg,
  IMultiMediaItemForUI,
  TSetter,
} from "../../../types/global";

interface IProps extends IGpUnitsItemsPg<IMultiMediaItemForUI> {
  setIsGpVideoModalShown: TSetter<boolean>;
  setSelectedVideo: TSetter<any>;
}

const GpVideos: React.FC<Partial<IProps>> = ({
  data,
  isLast,
  totalItemsNum,
  setIsGpVideoModalShown,
  setSelectedVideo,
}) => {
  const { btnTxt, gpDataObj, handleOnClick } = useGetGpDataStates(
    data ?? [],
    !!isLast,
    1,
    "videos",
    totalItemsNum ?? 0
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
        className={`${
          gpDataObj.data?.length ? "grid gap-3" : ""
        } mx-auto pb-1 p-4 pt-3 pb-5`}
      >
        {gpDataObj.data?.length ? (
          (gpDataObj.data ?? data).map((videoObj) => {
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
          <div className="pb-4 error-message-container">
            <p className="text-center text-sm-start">
              An error has occurred. Couldn&apos;t retrieve videos. Please try
              again by refreshing the page.
            </p>
          </div>
        )}
      </div>
      {!!gpDataObj.data?.length && !gpDataObj.isLast && (
        <SeeMoreBtnSec btnTxt={btnTxt} handleOnClick={handleOnClick}>
          {btnTxt === "Loading" ? (
            <span
              style={{ height: 25 }}
              className="d-inline-flex justify-content-center align-items-center w-100 position-relative"
            >
              <Spinner className="text-black" />
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
