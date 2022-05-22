import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";

import LessonHelperText from "components/LessonHelperText";
import TeachingMethod from "./TeachingMethod";
import CollapsibleSection from "../CollapsibleSection";

import { METHODS } from "./constants";

import "./style.scss";
import lessonPlanStyle from "assets/jss/material-kit-pro-react/views/lessonPlanStyle.js";

const useStyles = makeStyles(lessonPlanStyle);

const TeachingResources = ({
  index,
  SectionTitle,
  Data: {
    classroom,
    remote
  },
}) => {
  const classes = useStyles();
  return (
    <CollapsibleSection
      initiallyExpanded
      index={index}
      SectionTitle={SectionTitle}
    >
      <div className={classes.container}>
        {classroom && remote && <LessonHelperText text="Click a category for more details"/>}
        {classroom && (
          <TeachingMethod
            type={METHODS.IN_PERSON}
            key={METHODS.IN_PERSON}
            initiallyExpanded={!remote}
            {...classroom}
          />
        )}
        {remote && (
          <TeachingMethod
            type={METHODS.REMOTE}
            key={METHODS.REMOTE}
            initiallyExpanded={!classroom}
            {...remote}
          />
        )}
      </div>
    </CollapsibleSection>
  );
};

TeachingResources.propTypes = {
  SectionTitle: PropTypes.string,
  Data: PropTypes.shape({
    classroom: PropTypes.object,
    remote: PropTypes.object,
  }),
  TeachingMethod: PropTypes.array,
};

export default TeachingResources;
