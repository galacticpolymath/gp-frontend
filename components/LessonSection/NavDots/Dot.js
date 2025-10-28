/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
 
/* eslint-disable semi */
/* eslint-disable quotes */

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