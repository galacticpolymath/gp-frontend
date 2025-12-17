/* eslint-disable semi */
 
/* eslint-disable indent */
 
/* eslint-disable no-multiple-empty-lines */
import { useEffect, useState } from 'react';
import filterResults from '../helperFns/filterResults';



export const useGetJobCategories = (hierarchyNum, level) => {
    const [isGettingData, setIsGettingData] = useState(true);
    const [hierarchyNumAndLevel, setHierarchyNumAndLevel] = useState({ hierarchyNum: hierarchyNum, level: level });
    const [jobCategories, setJobCategories] = useState([]);

    useEffect(() => {
        const { hierarchyNum: currentHierarchyNum, level: currentLevel } = hierarchyNumAndLevel ?? {};

        if ((currentHierarchyNum !== hierarchyNum) || (currentLevel !== level)) {
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

    return { jobCategories, _setIsGettingData: [isGettingData, setIsGettingData] };
};