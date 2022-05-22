import React, { useState } from "react";
import PropTypes from "prop-types";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import LessonHelperText from "components/LessonHelperText";

import ResourceSummary2 from "./ResourceSummary2";
import VariantSummary from "./VariantSummary";
import GradeVariant from "./GradeVariant";

import { METHODS, COPY, ICONS, TITLES } from "./constants";

const TeachingMethod = ({
  type,
  resourceSummary,
  gradeVariantNotes,
  resources = [],
  initiallyExpanded
}) => {
  const [expanded, expand] = useState(initiallyExpanded);

  return (
    <ExpansionPanel
      className="TeachingMethod ExpansionPanel"
      onChange={() => expand(!expanded)}
      expanded={expanded}
    >
      <ExpansionPanelSummary
        className="ExpansionPanelSummary"
        expandIcon={<ExpandMoreIcon />}
      >
        <div>
          <h3>
            {ICONS[type]} {TITLES[type]}
          </h3>
          {COPY[type]}
        </div>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className="ExpansionPanelDetails">
        {type === METHODS.IN_PERSON && (
          <p className="footnote">
            *You will need to be logged into a{" "}
            <a
              href="https://accounts.google.com/signup/v2/webcreateaccount?hl=en&flowName=GlifWebSignIn&flowEntry=SignUp"
              target="blank"
              rel="noopener noreferrer"
            >
              free Google account
            </a>{" "}
            and click &quot;Use Template&quot; to add files to your Google
            Drive.
          </p>
        )}

        <ResourceSummary2
          resources={resourceSummary}
          footnote={
            type === METHODS.REMOTE && (
              <p>
                *Remote teaching of our lessons requires a minimum (free) Silver
                Subscription to Nearpod.{" "}
                <a
                  href="https://nearpod.com/signup/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Sign up here.
                </a>
              </p>
            )
          }
        />
        {gradeVariantNotes && <VariantSummary variants={gradeVariantNotes} />}
        {resources.length > 1 && <LessonHelperText text="Click grade band to see materials" />}
        {resources.map((resource, i) => (
          <GradeVariant key={i} initiallyExpanded={resources.length === 1} {...resource} />
        ))}

      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

TeachingMethod.propTypes = {
  type: PropTypes.string,
  resourceSummary: PropTypes.array,
  gradeVariantNotes: PropTypes.array,
  resources: PropTypes.array,
  initiallyExpanded: PropTypes.bool,
};

export default TeachingMethod;
