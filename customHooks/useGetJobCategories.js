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

    
    // GOAL: solve the bug when getting the third level of job categories 
    // GOAL: getting results should be dynamic when the user clicks on a specific job category

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
                console.log("job: ", job)
                const selectedLevel = job[`level${hierarchy}`] 
                console.log("selectedLevel: ", selectedLevel)

                return {
                    ...job,
                    id,
                    currentLevel: selectedLevel,
                    title: title
                }
            });
            console.log("targetJobCategories: ", targetJobCategories);
            // MAIN GOAL: create a state that contain all of the job categories that were selected so that they can be represented onto the UI as a chain 
            // GOALs:
            // GOAL #1: get the name of the job category that was clicked 
            // GOAL #2: add it as an object to the jobCategoriesChain state (to get the name, find the object that contains do hierarchyNum - 1 as its value in hierarchyNum, and the previous selectedLevel)


            setJobCategories(targetJobCategories);
            setIsGettingData(false);
            return;
        }
    }, [isGettingData, hierarchyNumAndLevel]);

    return { isGettingData, getNewJobsData, jobCategories };
};