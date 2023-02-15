/* eslint-disable quotes */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable semi */
import { Button } from "react-bootstrap";
import AccountTreeIcon from "@material-ui/icons/AccountTree";

// if there are no results, then display the default results (see the current ui)

const JobCategories = ({ searchResults }) => {
    // put the path into the url:
    const startingResults = [{ jobField: "Architecture & Engineering occupations", path: "" }, { jobField: "Arts, design, entertainment, sports, & media occupations", path: "" }, { jobField: "Building & grounds cleaning & maintenance occupations", path: "" }, { jobField: "Business & financial operations occupations", path: "" }, { jobField: "Community & social service occupations", path: "" }, { jobField: "Computer & mathematical occupations", path: "" }]

    // when the user clicks on any of the buttons in the above, take the user to specific search result. 

    return (
        <section className="pt-5 d-flex justify-content-center align-items-center">
            {searchResults ?
                <div>
                    {/* display the search results based on what is stored in the params */}
                </div>
                :
                <div className="jobCategoriesSec">
                    {/* display the default search results */}
                    {startingResults.map(({ jobField }, key) =>
                        <div key={key} className="shadow jobFieldStartingResult d-flex flex-column">
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