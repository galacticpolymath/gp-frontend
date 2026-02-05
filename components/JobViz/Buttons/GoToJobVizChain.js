 
 
 
 
 
 
 
 
 
 

import { Button } from 'react-bootstrap';
import Fade from '../../Fade';
import { IoArrowDown } from 'react-icons/io5';


const GoToJobVizChain = ({ isScrollToJobVizChainBtnVisible }) => {

    const goToJobVizChain = () => {
        document.getElementById("jobCategoryChainCard").scrollIntoView({ block: 'center', align: 'center', behavior: 'smooth' });
    }

    return (
        <Fade showElement={isScrollToJobVizChainBtnVisible} containerId="goToJobVizChainCardId">
            <Button
                className={`position-fixed jobVizNavBtn goToJobVizCardBtn rounded-circle d-flex flex-column justify-content-between bg-secondary`}
                onClick={goToJobVizChain}
            >
                <span className="pt-md-2 pt-lg-3 w-100 text-center h-50 d-none d-sm-flex justify-content-center align-items-center">
                    Go to Job Viz chains
                </span>
                <span className="pt-2 pt-md-2 pt-lg-3 w-100 text-center h-50 d-flex d-sm-none justify-content-center align-items-center">
                    Job Viz Chains
                </span>
                <span className="pt-md-3 pt-lg-0 w-100 h-50 d-flex justify-content-center align-items-center">
                    <IoArrowDown />
                </span>
            </Button>
        </Fade>
    )

}

export default GoToJobVizChain;