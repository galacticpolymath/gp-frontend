import React, { useState } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import Image from "../../../components/StrapiImage";
import RichText from "../../../components/RichText";

import lessonPlanStyle from "assets/jss/material-kit-pro-react/views/lessonPlanStyle.js";
const useStyles = makeStyles(lessonPlanStyle);

const LearningChart = ({ Title, Description, Footnote, Badge }) => {
  const classes = useStyles();
  const [expanded, expand] = useState(false);

  return (
    <div className={classes.container + " LearningChart"}>
      <Image {...Badge} />

      <ExpansionPanel
        className="ExpansionPanel"
        expanded={expanded}
        onChange={() => expand(!expanded)}
      >
        <ExpansionPanelSummary
          className="ExpansionPanelSummary"
          expandIcon={<ExpandMoreIcon />}
        >
          <h3>{Title}</h3>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className="ExpansionPanelDetails">
          <RichText content={Description} />
          <RichText className="footnote" content={Footnote} />
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </div>
  );
};

LearningChart.propTypes = {
  Title: PropTypes.string,
  Description: PropTypes.string,
  Footnote: PropTypes.string,
  Badge: PropTypes.object,
};

export default LearningChart;
