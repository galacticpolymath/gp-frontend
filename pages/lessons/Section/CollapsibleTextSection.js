import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";

import RichText from "../../../components/RichText";

import lessonPlanStyle from "assets/jss/material-kit-pro-react/views/lessonPlanStyle.js";
import CollapsibleSection from "./CollapsibleSection";
const useStyles = makeStyles(lessonPlanStyle);

const CollapsibleTextSection = ({
  index,
  SectionTitle,
  Content,
  InitiallyExpanded,
}) => {
  const classes = useStyles();
  return (
    <CollapsibleSection
      className="CollapsibleTextSection"
      index={index}
      SectionTitle={SectionTitle}
      initiallyExpanded={InitiallyExpanded !== false}
    >
      <div className={classes.container}>
        <RichText content={Content} />
      </div>
    </CollapsibleSection>
  );
};

CollapsibleTextSection.propTypes = {
  Content: PropTypes.string,
};

export default CollapsibleTextSection;
