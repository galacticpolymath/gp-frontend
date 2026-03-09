 
 
 
 
 
 
import { useEffect, useRef } from "react"

const UserFeedBack = ({ feedBack, index }) => {
    const divRef = useRef(null)

    useEffect(() => {
        if(feedBack.willScrollIntoView) {
            // divRef.current.focus()
            divRef.current.scrollIntoView({"behavior": "auto", 
            block: "nearest",
            inline: "center"}
            )
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