 
 
 
 
 
 
 
 
import { Button } from "react-bootstrap";
import Fade from "../../Fade";
import { IoArrowUp } from 'react-icons/io5';

const GoToSearchInput = ({ isScrollToInputBtnVisible }) => {

    const goToSearchInput = () => {
        document.getElementById("searchInputField").scrollIntoView({ block: 'center', behavior: 'smooth' });
    }

    return (
        <Fade showElement={isScrollToInputBtnVisible} containerId="searchInputBtnId">
            <Button
                className={`position-fixed jobVizNavBtn goToSearchInputBtn rounded-circle d-flex flex-column`}
                onClick={goToSearchInput}
            >
                <span className="w-100 text-center h-50 d-flex justify-content-center align-items-center">
                    <IoArrowUp />
                </span>
                <span className="w-100 h-50 d-none d-sm-flex justify-content-center align-items-center pb-4">
                    Go to search
                </span>
                <span className="w-100 h-50 d-flex d-sm-none justify-content-center align-items-center pb-4">
                    Search
                </span>
            </Button>
        </Fade>
    )
}

export default GoToSearchInput