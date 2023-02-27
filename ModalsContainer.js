/* eslint-disable comma-dangle */
/* eslint-disable quotes */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable no-unexpected-multiline */
/* eslint-disable semi */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable no-console */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */

import { useContext } from "react";
import { ModalContext } from "./providers/ModalProvider";
import SelectedJob from "./components/Modals/SelectedJob";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useState } from "react";

const ModalContainers = () => {
    const router = useRouter();
    const { _selectedJob, _isJobModalOn } = useContext(ModalContext);
    const [selectedJob,] = _selectedJob;
    const [isJobModalOn] = _isJobModalOn;
    const [currentPathWheModalIsOn, setCurrentPathWheModalIsOn] = useState("")

    // useEffect(() =>{
    //     // if the selectedJOb is not null and the path changes, then reset selectedJob state to
    //     if(selectedJob){
    //         setCurrentPathWheModalIsOn(router.query['search-results'])
    //     }

    // },[router.asPath])


    // useEffect(() => {
    //     console.log("currentPathWheModalIsOn: ", currentPathWheModalIsOn)
    //     setCurrentPathWheModalIsOn()

    // },[currentPathWheModalIsOn])

    return (
        <>
            {selectedJob ? <SelectedJob /> : null}
        </>
    )
}

export default ModalContainers;