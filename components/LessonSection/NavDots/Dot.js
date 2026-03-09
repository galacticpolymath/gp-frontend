 
 
 
 
 
 

import { useMemo } from "react";
import { getNavDotIconStyles } from "../../../helperFns/getNavDotIconStyles";

const Dot = ({ isHighlighted }) => {
    const iconStyles = useMemo(() => getNavDotIconStyles(isHighlighted, null), [isHighlighted]);

    return (
        <i
            style={iconStyles}
        />
    )
}

export default Dot;