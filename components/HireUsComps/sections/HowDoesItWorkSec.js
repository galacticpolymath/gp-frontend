/* eslint-disable no-multiple-empty-lines */
/* eslint-disable quotes */
 
 
 
 
/* eslint-disable react/jsx-indent-props */
/* eslint-disable semi */
 
 
 
 
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
import { getMediaComponent as Video } from "../../LessonSection/Preview/utils";
import { useEffect, useState } from "react";


const HowDoesItWorkSec = () => {
    const [isDOMLoaded, setIsDOMLoaded] = useState(false);

    useEffect(() => {
        setIsDOMLoaded(true);
    }, []);

    return (
        <section className="d-flex flex-column mt-2 mb-2 howDoesItWorkSec">
            <section className="d-flex justify-content-center align-items-center d-sm-block justify-sm-content-start align-sm-items-stretch ps-sm-5 pe-sm-5">
                <h3 className="text-center text-sm-start">
                    How does it work?
                </h3>
            </section>
            <section className="d-flex flex-column justify-content-md-center align-items-md-center justify-content-lg-start align-items-lg-stretch flex-lg-row ps-sm-5 pe-sm-5">
                <div className='position-relative w-100 how-does-it-work-vid-container mt-1 mt-sm-0'>
                    {isDOMLoaded && (
                        <Video
                            type="video"
                            mainLink="https://www.youtube.com/embed/xNQ67GFYCCQ"
                        />
                    )}
                </div>
            </section>
        </section>
    );
}

export default HowDoesItWorkSec;