/* eslint-disable react/jsx-tag-spacing */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable react/jsx-first-prop-new-line */
/* eslint-disable brace-style */
/* eslint-disable comma-dangle */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable quotes */
/* eslint-disable semi */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
import { useEffect, useRef } from "react"

const UserFeedBack = ({ feedBack, index }) => {
    const divRef = useRef(null)

    useEffect(() => {
        if(feedBack.willScrollIntoView) {
            // divRef.current.focus()
            // divRef.current.scrollIntoView()
            // divRef.current()
        }
    }, [feedBack.willScrollIntoView])

    return (
        <div ref={divRef} style={{ transform: `translate(-${index * 100})%`}}>
            {index}
        </div>    
    )
}

export default UserFeedBack;