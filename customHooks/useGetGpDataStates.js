/* eslint-disable quotes */
/* eslint-disable no-console */
/* eslint-disable indent */
import axios from "axios";
import { useEffect, useState } from "react";

// typeStr = 'videos' | 'lessons' | 'units'
const getGpUnitData = async (typeStr, pageNum, urlStr) => {
    try {
        const response = await axios.get(`${urlStr}/cached-gp-data`, { params: { pageNum: pageNum, type: typeStr } });

        return { data: response.data.data, isLast: response.data.isLast, totalItemsNum: response.data.totalItemsNum };
    } catch (error) {
        const { status, data } = error?.response ?? {};
        console.error('ERROR STATUS CODE: ', status);
        console.error('Failed to get gp unit data. Reason: ', data.msg);

        return null;
    }
};

export const useGetGpDataStates = (dataDefaultVal, isLast, nextPgNumStartingVal, gpDataTypeStr, totalGpDataItems) => {
    const [btnTxt, setBtnTxt] = useState(`See More (${totalGpDataItems - dataDefaultVal.length})`);
    const [gpDataObj, setGpDataObj] = useState({
        data: dataDefaultVal,
        isLast: isLast,
        nextPgNum: nextPgNumStartingVal,
    });

    const handleOnClick = async () => {
        try {
            setBtnTxt('Loading...');
            console.log('gpDataObj, yo there meng: ', gpDataObj);
            const gpVideosResponse = await getGpUnitData(gpDataTypeStr, gpDataObj.nextPgNum, `${window.location.origin}/api`);

            console.log('hey there meng, gpVideosResponse: ', gpVideosResponse);

            if (!gpVideosResponse?.data?.length) {
                throw new Error(`Failed to get the next page of videos from the server. Received: ${gpVideosResponse.data}`);
            }

            gpVideosResponse.data[0] = { ...gpVideosResponse.data[0], willScrollIntoView: true };
            console.log('gpVideosResponse, yo there: ', gpVideosResponse);
            const gpDataArr = [...gpDataObj.data, ...gpVideosResponse.data];
            let gpVideosObjUpdated = {
                ...gpDataObj,
                totalItemsNum: gpVideosResponse.totalItemsNum,
                data: gpDataArr,
            };

            console.log('gpVideosObjUpdated: ', gpVideosObjUpdated);

            if (gpVideosResponse.isLast) {
                console.log('Reached the end of specified gp unit data.');
                gpVideosObjUpdated = {
                    ...gpVideosObjUpdated,
                    isLast: true,
                };
                setGpDataObj(gpVideosObjUpdated);
                setBtnTxt('See More');
                return;
            }
            console.log('gpVideosResponse: ', gpVideosResponse);

            setGpDataObj(state => ({ ...gpVideosObjUpdated, nextPgNum: state.nextPgNum + 1 }));
            setBtnTxt(`See More (${gpVideosResponse.totalItemsNum - gpDataArr.length})`);
        } catch (error) {
            console.error('Failed to get gp unit data from the server. Reason: ', error);
            setBtnTxt('ERROR! Try again.');
        }
    };

    useEffect(() => {
        if (gpDataObj.data.some(vid => vid.willScrollIntoView)) {
            setTimeout(() => {
                setGpDataObj(state => ({
                    ...state,
                    data: state.data.map(vid => ({ ...vid, willScrollIntoView: false })),
                }));
            }, 400);
        }
    }, [gpDataObj.data]);

    return {
        btnTxt,
        gpDataObj,
        handleOnClick,
    };
};