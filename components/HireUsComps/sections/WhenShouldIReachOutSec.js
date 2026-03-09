 
 
 
 
 
 
 

import LetsTalkBtnContainer from "../buttons/LetsTalkBtnContainer"

const WhenShouldIReachOutSec = () => {
    return (
        <section className="row text-dark my-5 py-3">
            <div className="col-1 col-md-2"/>
            <div className="col-12 col-md-6">
                <h2 className="text-left ">When should I reach out?</h2>
                <span className="fs-5">
                    Any time! Whether you have funds now, want to write us into a proposal, or just have a question, we are here to help!
                </span>
                <div className="d-flex justify-content-left ps-3 mt-4">
                    <LetsTalkBtnContainer isDarker />
                </div>
            </div>
        </section >
    )
}

export default WhenShouldIReachOutSec;