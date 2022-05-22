import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";

import lessonPlanStyle from "assets/jss/material-kit-pro-react/views/lessonPlanStyle.js";
const useStyles = makeStyles(lessonPlanStyle);

const Heading = ({ index, SectionTitle }) => {
  const classes = useStyles();

  return (
    <h2
      className="SectionHeading"
      id={SectionTitle.replace(/\s+/g, "_").toLowerCase()}
    >
      <div className={classes.container}>
        {index}. {SectionTitle}
      </div>
    </h2>
  );
};

Heading.propTypes = {
  index: PropTypes.number,
  SectionTitle: PropTypes.string,
};

export default Heading;
