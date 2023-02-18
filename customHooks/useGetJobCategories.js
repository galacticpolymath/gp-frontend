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
import jobVizData from '../data/Jobviz/jobVizData.json';

// this hook will return the following:
// isGettingData: true
// jobs
// setIsGettingData
// state called hierarchyAndLevel
// make the query to jobVizData.json in a useEffect hook
// while doing that, return isLoading true
// 


// WHEN THE PROPS CHANGE, it does not update hierarchyNumAndLevel state 

// export const filterResults = (targetHierarchyNum, selectedLevel) => {
//     let targetJobCategories = jobVizData.filter(jobCategory => {
//         const targetLevel = jobCategory[`level${targetHierarchyNum - 1}`]; 
//         return ((jobCategory.hierarchy === parseInt(targetHierarchyNum)) && (targetLevel === selectedLevel));
//     });
//     targetJobCategories = targetJobCategories.map(job => {
//         const { hierarchy, id, title } = job;
//         const selectedLevel = job[`level${hierarchy}`] 

//         return {
//             ...job,
//             id,
//             currentLevel: selectedLevel,
//             title: title
//         }
//     });
//     return targetJobCategories;
// }



// WHAT I WANT: when the hierarchNum and level props changes, update the hierarchyNumAndLevel state
export const useGetJobCategories = (hierarchyNum, level) => {
    console.log("hierarchyNum: ", hierarchyNum);
    const [isGettingData, setIsGettingData] = useState(true);
    const [hierarchyNumAndLevel, setHierarchyNumAndLevel] = useState({ hierarchyNum: hierarchyNum, level: level });
    const [jobCategories, setJobCategories] = useState([]);

    const getNewJobsData = (hierarchyNum, level) => {
        setIsGettingData(true);
        setHierarchyNumAndLevel({ hierarchyNum: hierarchyNum, level: level });
    };

    useEffect(() => {
        const { hierarchyNum: currentHierarchyNum, level: currentLevel } = hierarchyNumAndLevel ?? {};
        if (currentHierarchyNum !== hierarchyNum || currentLevel !== level){
            setHierarchyNumAndLevel({ hierarchyNum: hierarchyNum, level: level });
        }
    }, [hierarchyNum, level])



    useEffect(() => {
        console.log("hierarchyNumAndLevel: ", hierarchyNumAndLevel);
        const { hierarchyNum: targetHierarchyNum, level: selectedLevel } = hierarchyNumAndLevel ?? {};
        
        if (isGettingData && targetHierarchyNum && selectedLevel) {
            let targetJobCategories = jobVizData.filter(jobCategory => {
                const targetLevel = jobCategory[`level${targetHierarchyNum - 1}`]; 
                return ((jobCategory.hierarchy === parseInt(targetHierarchyNum)) && (targetLevel === selectedLevel));
            });
            targetJobCategories = targetJobCategories.map(job => {
                const { hierarchy, id, title } = job;
                const selectedLevel = job[`level${hierarchy}`] 

                return {
                    ...job,
                    id,
                    currentLevel: selectedLevel,
                    title: title
                }
            });
            


            setJobCategories(targetJobCategories);
            setIsGettingData(false);
            return;
        }
    }, [isGettingData, hierarchyNumAndLevel]);

    return { isGettingData, getNewJobsData, jobCategories };
};