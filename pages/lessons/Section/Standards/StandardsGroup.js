import React, { useState } from "react";
import PropTypes from "prop-types";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import RichText from "components/RichText";

import { formatAlignmentNotes } from "./utils";

const formatGrades = (grades) => {
  if (!grades) return "";

  const parsedGrades = grades.split(",").map((x) => x.replace(/^0/, ""));
  if (parsedGrades.length === 1) {
    return "Grade: " + parsedGrades[0];
  }
  return (
    "Grades: " + parsedGrades[0] + "-" + parsedGrades[parsedGrades.length - 1]
  );
};

const StandardsGroup = ({ codes, grades, alignmentNotes, statements }) => {
  const [expanded, expand] = useState(false);

  return (
    <ExpansionPanel
      className="StandardsGroup"
      expanded={expanded}
      onChange={() => expand(!expanded)}
    >
      <ExpansionPanelSummary
        className="ExpansionPanelSummary codes"
        expandIcon={<ExpandMoreIcon />}
      >
        <div>
          <p className="grades">{formatGrades(grades)}</p>
          {[].concat(codes).map((code, i) => (
            <p key={i}>
              <strong>{code}:</strong> {[].concat(statements)[i]}
            </p>
          ))}
        </div>
      </ExpansionPanelSummary>

      <ExpansionPanelDetails className="alignmentNotes">
        <h6>How does the lesson align to this standard?</h6>
        <RichText content={formatAlignmentNotes(alignmentNotes)} />
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

StandardsGroup.propTypes = {
  codes: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  statements: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  alignmentNotes: PropTypes.string,
};

export default StandardsGroup;
