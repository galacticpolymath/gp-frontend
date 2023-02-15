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

// if there are no results, then display the default results (see the current ui)
const startingResults =
    [
        {
            jobField: "Architecture & Engineering occupations",
            id: "engineeringElId",
            path: "17-0000"
        },
        {
            jobField: "Arts, design, entertainment, sports, & media occupations",
            id: "artsDesignElId",
            startingLevel: "27-0000"
        },
        {
            jobField: "Building & grounds cleaning & maintenance occupations",
            id: "maintenanceElId",
            startingLevel: "37-0000"
        },
        {
            jobField: "Business & financial operations occupations",
            id: "businessElId",
            startingLevel: "13-0000"
        }
        ,
        {
            jobField: "Community & social service occupations",
            id: "serviceElId",
            startingLevel: "21-0000"
        },
        {
            jobField: "Computer & mathematical occupations",
            id: "computerElId",
            startingLevel: "15-0000"
        }
    ]

// CASE:
// the user clicks on the "More Jobs" button for "Architecture & Engineering occupations"
// GOAL:
// get all of data from jobVizData that meets the following criteria: 
// hierarchy = 2
// level1 = 17-0000
const JobCategories = ({ searchResults }) => {
    // put the path into the url:


    // when the user clicks on any of the buttons in the above, take the user to specific search result. 

    // When the user clicks on 

    return (
        <section className="pt-5 d-flex justify-content-center align-items-center">
            {searchResults ?
                <div>
                    {/* display the search results based on what is stored in the params */}
                </div>
                :
                <div className="jobCategoriesSec">
                    {/* display the default search results */}
                    {startingResults.map(({ jobField, id }) =>
                        <div id={id} key={id} className="shadow jobFieldStartingResult d-flex flex-column">
                            <section className="w-100 h-50 d-flex justify-content-center align-items-center">
                                <h4 className="text-center">{jobField}</h4>
                            </section>
                            <section className="w-100 h-50 d-flex justify-content-center align-items-center">
                                <Button className="d-flex job-categories-btn shadow">
                                    <AccountTreeIcon /> More Jobs
                                </Button>
                            </section>
                        </div>
                    )}
                </div>
            }
        </section>
    );
};

export default JobCategories;