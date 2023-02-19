/* eslint-disable no-debugger */
/* eslint-disable semi */
/* eslint-disable comma-dangle */
/* eslint-disable no-console */
/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable no-multiple-empty-lines */
import { useEffect, useState } from 'react';
import filterResults from './helperFns/filterResults';



export const useGetJobCategories = (hierarchyNum, level, title) => {
    const [isGettingData, setIsGettingData] = useState(true);
    const [hierarchyNumAndLevel, setHierarchyNumAndLevel] = useState({ hierarchyNum: hierarchyNum, level: level });
    const [jobCategories, setJobCategories] = useState([]);
    const [parentJobCategories, setParentJobCategories] = useState([]);

    const getNewJobsData = (hierarchyNum, level) => {
        setIsGettingData(true);
        setHierarchyNumAndLevel({ hierarchyNum: hierarchyNum, level: level });
    };

    // GOAL:  update parentJobCategories array when the user changes levels

    useEffect(() => {
        const { hierarchyNum: currentHierarchyNum, level: currentLevel } = hierarchyNumAndLevel ?? {};

        if ((currentHierarchyNum !== hierarchyNum) || (currentLevel !== level)){
            setHierarchyNumAndLevel({ hierarchyNum: hierarchyNum, level: level });
        }
    }, [hierarchyNum, level])



    useEffect(() => {
        const { hierarchyNum: targetHierarchyNum, level: selectedLevel } = hierarchyNumAndLevel ?? {};
        
        if (isGettingData && targetHierarchyNum && selectedLevel) {
            const targetJobCategories = filterResults(parseInt(targetHierarchyNum), selectedLevel);
            setJobCategories(targetJobCategories);
            setIsGettingData(false);
            // setParentJobCategories(parentJobCategories => [...parentJobCategories, { categoryName: title, hierarchyNum: hierarchyNum, level: level }].reverse());
            return;
        }
    }, [isGettingData, hierarchyNumAndLevel]);

    return { isGettingData, getNewJobsData, jobCategories, parentJobCategories };
};