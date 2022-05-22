import React, { useState } from "react";

import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import DownloadIcon from "@material-ui/icons/GetApp";

import VariantPart from "./VariantPart";
import DownloadHelp from "./DownloadHelpModal";

const GradeVariant = ({
  parts = [],
  links,
  grades,
  gradePrefix,
  initiallyExpanded
}) => {
  const [expanded, expand] = useState(initiallyExpanded);
  return (
    <ExpansionPanel
      className="GradeVariant ExpansionPanel"
      onChange={() => expand(!expanded)}
      expanded={expanded}
    >
      <ExpansionPanelSummary
        className="ExpansionPanelSummary"
        expandIcon={<ExpandMoreIcon />}
      >
        <h5>{grades}</h5>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className="ExpansionPanelDetails">
        {links && (
          <div className="downloadAll">
            <a
              className="download"
              target="_blank"
              rel="noopener noreferrer"
              href={links.url}
            >
              <DownloadIcon />
              {links.linkText}
            </a>

            <DownloadHelp id={gradePrefix} />
          </div>
        )}
        <div className="VariantParts">
          {parts.map((part, i) => (
            <VariantPart key={i} {...part} gradePrefix={gradePrefix} />
          ))}
        </div>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

export default GradeVariant;
