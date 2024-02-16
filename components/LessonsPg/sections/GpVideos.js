/* eslint-disable no-console */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
/* eslint-disable no-undef */
import { useEffect, useState } from "react";
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
        const pathObj = pathOptions.find(({ type }) => type === typeStr);

        if (!pathObj) {
            throw new Error('Invalid value passed for the `typeStr` parameter. Can only be one of the following: "videos", "lessons", or ""');
        }

        const finalUrlStr = `${urlStr}/${pathObj.path}`;
        const response = await axios.get(finalUrlStr, { params: { pageNum: pageNum } });

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
    const [btnTxt, setBtnTxt] = useState('See More');
    const [gpVideosObj, setGpVideosObj] = useState({
        data: startingGpVids,
        isLast: isLast,
        nextPgNum: nextPgNumStartingVal,
    });

    const handleOnClick = async () => {
        try {
            setBtnTxt('Loading...');

            const gpVideosResponse = await getGpUnitData('videos', gpVideosObj.nextPgNum, `${window.location.origin}/api`);

            if (!gpVideosResponse.data?.length) {
                throw new Error(`Failed to get the next page of videos from the server. Received: ${gpVideosResponse.data}`);
            }

            gpVideosResponse.data[0] = { ...gpVideosResponse.data[0], willScrollIntoView: true };

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
                setBtnTxt('See More.');
                return;
            }

            setGpVideosObj(state => ({ ...gpVideosObjUpdated, nextPgNum: state.nextPgNum + 1 }));
            setBtnTxt('See More.');
        } catch (error) {
            console.error('Failed to get gp unit data from the server. Reason: ', error);
            setBtnTxt('ERROR! Try again.');
        }
    };

    useEffect(() => {
        if (gpVideosObj.data.some(vid => vid.willScrollIntoView)) {
            setTimeout(() => {
                setGpVideosObj(state => ({
                    ...state,
                    data: state.data.map(vid => ({ ...vid, willScrollIntoView: false })),
                }));
            }, 400);
        }
    }, [gpVideosObj.data]);

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