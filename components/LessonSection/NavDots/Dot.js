/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable curly */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable no-unused-vars */
/* eslint-disable semi */
/* eslint-disable quotes */
/* eslint-disable no-console */

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