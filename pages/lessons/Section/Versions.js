import React from "react";
import PropTypes from "prop-types";

import CollapsibleSection from "./CollapsibleSection";

import { makeStyles } from "@material-ui/core/styles";
import lessonPlanStyle from "assets/jss/material-kit-pro-react/views/lessonPlanStyle.js";
import RichText from "../../../components/RichText";
const useStyles = makeStyles(lessonPlanStyle);

const Versions = ({ index, SectionTitle, Data = [] }) => {
  const classes = useStyles();
  return (
    <CollapsibleSection
      className="Versions"
      index={index}
      SectionTitle={SectionTitle}
    >
      <div className={classes.container}>
        {Data &&
          Data.map(({ major_release, sub_releases = [] }, i) => (
            <div className="major" key={i}>
              <h4>Major Release {major_release}</h4>
              {sub_releases.map(
                ({ version, date, summary, notes, acknowledgments }) => (
                  <div className="minor" key={version}>
                    <h5>
                      {version} {summary}
                    </h5>
                    <p className="date">{date}</p>
                    {notes &&
                      <RichText content={notes} />
                    }
                    {acknowledgments &&
                    <div className={classes.acknowledgment}>Acknowledgments:
                      <RichText content={acknowledgments} />
                      </div>
                    }
                  </div>
                )
              )}
            </div>
          ))}
      </div>
    </CollapsibleSection>
  );
};

Versions.propTypes = {
  index: PropTypes.number,
  SectionTitle: PropTypes.string,
  Data: PropTypes.array,
};

export default Versions;
