/* eslint-disable quotes */
/* eslint-disable no-console */
/* eslint-disable indent */
import axios from "axios";
import { useEffect, useState } from "react";

// typeStr = 'videos' | 'lessons' | 'units'
const getGpUnitData = async (typeStr, pageNum, urlStr) => {
    try {
        const response = await axios.get(`${urlStr}/cached-gp-data`, { params: { pageNum: pageNum, type: typeStr } });

        return { data: response.data.data, isLast: response.data.isLast };
    } catch (error) {
        const { status, data } = error?.response ?? {};
        console.error('ERROR STATUS CODE: ', status);
        console.error('Failed to get gp unit data. Reason: ', data.msg);

        return null;
    }
};

export const useGetGpDataStates = (dataDefaultVal, isLast, nextPgNumStartingVal, gpDataTypeStr) => {
    console.log('yo there meng, nextPgNumStartingVal: ', nextPgNumStartingVal);
    const [btnTxt, setBtnTxt] = useState('See More');
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

            if (!gpVideosResponse?.data?.length) {
                throw new Error(`Failed to get the next page of videos from the server. Received: ${gpVideosResponse.data}`);
            }

            gpVideosResponse.data[0] = { ...gpVideosResponse.data[0], willScrollIntoView: true };

            let gpVideosObjUpdated = {
                ...gpDataObj,
                data: [...gpDataObj.data, ...gpVideosResponse.data],
            };

            if (gpVideosResponse.isLast) {
                console.log('Reached the end of specified gp unit data.');
                gpVideosObjUpdated = {
                    ...gpVideosObjUpdated,
                    isLast: true,
                };
                setGpDataObj(gpVideosObjUpdated);
                setBtnTxt('See More.');
                return;
            }

            setGpDataObj(state => ({ ...gpVideosObjUpdated, nextPgNum: state.nextPgNum + 1 }));
            setBtnTxt('See More.');
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