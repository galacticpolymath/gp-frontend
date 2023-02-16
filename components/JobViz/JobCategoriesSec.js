/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable comma-dangle */
/* eslint-disable quotes */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable semi */
import { Button } from "react-bootstrap";
import AccountTreeIcon from "@material-ui/icons/AccountTree";
import { useRouter } from "next/router";

// if there are no results, then display the default results (see the current ui)
const startingJobResults =
    [
        {
            jobField: "Architecture & Engineering occupations",
            id: 120,
            startingLevel: "17-0000"
        },
        {
            jobField: "Arts, design, entertainment, sports, & media occupations",
            id: "artsDesignElId",
            startingLevel: "27-0000"
        },
        {
            jobField: "Building & grounds cleaning & maintenance occupations",
            id: 581,
            startingLevel: "37-0000"
        },
        {
            jobField: "Business & financial operations occupations",
            id: 355,
            startingLevel: "13-0000"
        }
        ,
        {
            jobField: "Community & social service occupations",
            id: 232,
            startingLevel: "21-0000"
        },
        {
            jobField: "Computer & mathematical occupations",
            id: 92,
            startingLevel: "15-0000"
        }
    ]

// CASE:
// the user clicks on the "More Jobs" button for "Architecture & Engineering occupations"
// GOAL:
// get all of data from jobVizData that meets the following criteria: 
// hierarchy = 2
// level1 = 17-0000
const JobCategories = ({ dynamicJobResults, currentLevelNum, setWillGetNewResults }) => {
    const router = useRouter();
    // put the path into the url:


    // when the user clicks on any of the buttons in the above, take the user to specific search result. 

    // When the user clicks on 
    const handleBtnClick = level => {
        console.log('level: ', level);
        router.push(`/job-viz/${currentLevelNum + 1}/${level}`)
        setWillGetNewResults && setWillGetNewResults(true);
        // GOAL: get the second level of job search results and displayed them onto the dom
        // the new results are passed into as a prop and the whole comp is re-rendered
        // th response with all of the new results are attained in the parent comp
        // send a get request to the server, getting the new results
        // for re-render the jobViz component
        // store the following as th params for the get request: the hierarchy num + 1, and the level1 string   
    }

    return (
        <section className="pt-3 d-flex justify-content-center align-items-center"> 
                <div className="jobCategoriesSec">
                    {/* display the default search results */}
                    {(dynamicJobResults ?? startingJobResults).map(({ jobField, id, startingLevel }) =>
                        <div id={id} key={id} className="shadow jobFieldStartingResult d-flex flex-column">
                            <section className="w-100 h-50 d-flex justify-content-center align-items-center">
                                <h4 className="text-center">{jobField}</h4>
                            </section>
                            <section className="w-100 h-50 d-flex justify-content-center align-items-center">
                                <Button id={`${id}_btn`} className="d-flex job-categories-btn shadow" onClick={() => handleBtnClick(startingLevel)}>
                                    <AccountTreeIcon /> More Jobs
                                </Button>
                            </section>
                        </div>
                    )}
                </div>
        </section>
    );
};

export default JobCategories;