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
        const { hierarchyNum: targetHierarchyNum, level: targetLevel1 } = hierarchyNumAndLevel ?? {};

        
        if (isGettingData && targetHierarchyNum && targetLevel1) {
            let targetJobCategories = jobVizData.filter(file => {
                const { hierarchy, level1 } = file;

                return ((hierarchy === parseInt(targetHierarchyNum)) && (level1 === targetLevel1));
            });
            targetJobCategories = targetJobCategories.map(job => {
                const { hierarchy, id, title } = job;
                console.log("job: ", job)
                const targetLevel = job[`level${hierarchy}`] 
                console.log("targetLevel: ", targetLevel)

                return {
                    id,
                    currentLevel: targetLevel,
                    title: title
                }
            });
            debugger
            console.log("targetJobCategories: ", targetJobCategories)
            setJobCategories(targetJobCategories);
            setIsGettingData(false);
            return;
        }
    }, [isGettingData, hierarchyNumAndLevel]);

    return { isGettingData, getNewJobsData, jobCategories };
};