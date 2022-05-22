import React, { useState } from "react";

import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import RichText from "components/RichText";
import ResourceGroup from "./ResourceGroup";

const VariantPart = ({ part, title, preface, itemList = [], gradePrefix }) => {
  const [expanded, expand] = useState(false);
  return (
    <ExpansionPanel
      className="VariantPart ExpansionPanel"
      onChange={() => expand(!expanded)}
      expanded={expanded}
    >
      <ExpansionPanelSummary
        className="ExpansionPanelSummary"
        expandIcon={<ExpandMoreIcon />}
      >
        <span>{gradePrefix}</span>
        <strong>
          Part {part}: {title}
        </strong>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className="ExpansionPanelDetails">
        <RichText className="VariantPreface" content={preface} />
        {itemList.length > 0 && (
          <ol>
            {itemList.map((item, i) => (
              <ResourceGroup key={i} {...item} />
            ))}
          </ol>
        )}
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

export default VariantPart;
