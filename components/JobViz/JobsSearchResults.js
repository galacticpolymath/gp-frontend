/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable semi */

// if there are no results, then display the default results (see the current ui)

const JobsSearchResults = ({ searchResults }) => {
    
    return (
        <section>
            {searchResults ?
                <div>
                    {/* display the search results based on what is stored in the params */}
                </div>
                :
                <div>
                {/* display the default parameters */}
                </div>
            }
        </section>
    );
};

export default JobsSearchResults;