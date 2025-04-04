/* eslint-disable quotes */
/* eslint-disable no-console */
/* eslint-disable indent */
import axios from "axios";
import { useEffect, useState } from "react";

// typeStr = 'videos' | 'lessons' | 'units'
const getGpUnitData = async (typeStr, pageNum, urlStr) => {
    try {
        const response = await axios.get(`${urlStr}/cached-gp-data`, { params: { pageNum: pageNum, type: typeStr }, timeout: 5_000 });

        return { data: response.data.data, isLast: response.data.isLast, totalItemsNum: response.data.totalItemsNum };
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            return { errType: 'timeout' };
        }

        const { status, data } = error?.response ?? {};
        console.error('ERROR STATUS CODE: ', status);
        console.error('Failed to get gp unit data. Reason: ', data.msg);

        return { errType: 'general' };
    }
};

export const useGetGpDataStates = (dataDefaultVal, isLast, nextPgNumStartingVal, gpDataTypeStr, totalGpDataItems) => {
    const itemsToShowStartingNum = Number.isInteger(totalGpDataItems) ? totalGpDataItems - dataDefaultVal?.length : 0;
    const [btnTxt, setBtnTxt] = useState(`Show More (${itemsToShowStartingNum})`);
    const [gpDataObj, setGpDataObj] = useState({
        data: dataDefaultVal,
        isLast: isLast,
        nextPgNum: nextPgNumStartingVal,
    });

    const handleOnClick = async () => {
        try {
            setBtnTxt('Loading');
            const gpVideosResponse = await getGpUnitData(gpDataTypeStr, gpDataObj.nextPgNum, `${window.location.origin}/api`);



            if (gpVideosResponse.errType === 'timeout') {
                alert(`Failed to get ${gpDataTypeStr}. Please refesh the page and try again.`);
                throw new Error('"axios" request error timeout has occurred.');
            }

            if (gpVideosResponse.errType) {
                throw new Error('Failed to get the gp unit data.');
            }

            if (!gpVideosResponse?.data?.length) {
                throw new Error(`Failed to get the next page of videos from the server. Received: ${gpVideosResponse.data}`);
            }

            gpVideosResponse.data[0] = { ...gpVideosResponse.data[0], willScrollIntoView: true };
            const gpDataArr = [...gpDataObj.data, ...gpVideosResponse.data];
            let gpVideosObjUpdated = {
                ...gpDataObj,
                totalItemsNum: gpVideosResponse.totalItemsNum,
                data: gpDataArr,
            };

            if (gpVideosResponse.isLast) {
                gpVideosObjUpdated = {
                    ...gpVideosObjUpdated,
                    isLast: true,
                };
                setGpDataObj(gpVideosObjUpdated);
                setBtnTxt(null);
                return;
            }

            setGpDataObj(state => ({ ...gpVideosObjUpdated, nextPgNum: state.nextPgNum + 1 }));
            setBtnTxt(`Show More (${gpVideosResponse.totalItemsNum - gpDataArr.length})`);
        } catch (error) {
            console.error('Failed to get gp unit data from the server. Reason: ', error);
            setBtnTxt('ERROR! Try again.');
        }
    };

    useEffect(() => {
        if (gpDataObj?.data?.length && gpDataObj.data.some(vid => vid.willScrollIntoView)) {
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