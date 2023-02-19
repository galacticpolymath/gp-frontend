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



export const useGetJobCategories = (hierarchyNum, level) => {
    const [isGettingData, setIsGettingData] = useState(true);
    const [hierarchyNumAndLevel, setHierarchyNumAndLevel] = useState({ hierarchyNum: hierarchyNum, level: level });
    const [jobCategories, setJobCategories] = useState([]);
    const _setIsGettingData = [isGettingData, setIsGettingData]

    useEffect(() => {
        const { hierarchyNum: currentHierarchyNum, level: currentLevel } = hierarchyNumAndLevel ?? {};

        if ((currentHierarchyNum !== hierarchyNum) || (currentLevel !== level)){
            setHierarchyNumAndLevel({ hierarchyNum: hierarchyNum, level: level });
        }
    }, [hierarchyNum, level])



    useEffect(() => {
        const { hierarchyNum: targetHierarchyNum, level: selectedLevel } = hierarchyNumAndLevel ?? {};
        
        if (targetHierarchyNum && selectedLevel) {
            const targetJobCategories = filterResults(parseInt(targetHierarchyNum), selectedLevel);
            setJobCategories(targetJobCategories);
            setIsGettingData(false);
            return;
        }
    }, [hierarchyNumAndLevel]);

    return { jobCategories, _setIsGettingData };
};