/* eslint-disable no-console */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
/* eslint-disable no-undef */
import { useState } from "react";
import VideoCard from "../VideoCard";
import axios from "axios";
import Button from "../../General/Button";

// typeStr = 'videos' | 'lessons'
const getGpUnitData = async (typeStr, pageNum, urlStr) => {
    try {
        const pathOptions = [
            {
                type: 'videos',
                path: 'get-cached-vids',
            },
        ];
        const path = pathOptions.find(({ type }) => type === typeStr);

        if (!path) {
            throw new Error('Invalid value passed for the `typeStr` parameter. Can only be one of the following: "videos", "lessons", or ""');
        }

        const response = await axios.get(`${urlStr}/${path}`, { params: { pageNum: pageNum } });

        return { data: response.data.data, isLast: response.data.isLast };
    } catch (error) {
        console.error(`Failed to get gp unit data. Reason: `, error);

        return null;
    }
};

const GpVideos = ({
    startingGpVids,
    isLast,
    nextPgNumStartingVal,
    setIsModalShown,
    setSelectedVideo,
}) => {
    const [gpVideosObj, setGpVideosObj] = useState({
        data: startingGpVids,
        isLast: isLast,
        nextPgNum: nextPgNumStartingVal,
    });

    const handleOnClick = async () => {
        const gpVideosResponse = await getGpUnitData('videos', gpVideosObj.nextPgNum, `${window.location.origin}/api`);
        let gpVideosObjUpdated = {
            ...gpVideosObj,
            data: [...gpVideosObj.data, ...gpVideosResponse.data],
        };

        if (gpVideosResponse.isLast) {
            console.log('Reached the end of specified gp unit data.');
            gpVideosObjUpdated = {
                ...gpVideosObjUpdated,
                isLast: true,
            };
            setGpVideosObj(gpVideosObjUpdated);
            return;
        }

        setGpVideosObj(state => ({ ...gpVideosObjUpdated, nextPgNum: state.nextPgNum + 1 }));
    };

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
                {gpVideosObj.data?.length && (
                    gpVideosObj.data.map(videoObj => {
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
            {!gpVideosObj.isLast && (
                <div className='w-100 d-flex justify-content-center align-items-center'>
                    <Button
                        handleOnClick={handleOnClick}
                        classNameStr="text-center w-100"
                    >
                        See More
                    </Button>
                </div>
            )}
        </section>
    );
};

export default GpVideos;