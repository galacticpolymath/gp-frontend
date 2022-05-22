import React from "react";
import PropTypes from "prop-types";

import CollapsibleSection from "./CollapsibleSection";

import { makeStyles } from "@material-ui/core/styles";
import lessonPlanStyle from "assets/jss/material-kit-pro-react/views/lessonPlanStyle.js";
const useStyles = makeStyles(lessonPlanStyle);

const Acknowledgments = ({ index, SectionTitle, Data = [] }) => {
  const classes = useStyles();
  return (
    <CollapsibleSection
      className="Acknowledgments"
      index={index}
      SectionTitle={SectionTitle}
    >
      <div className={classes.container}>
        {Data &&
          Data.map(({ role, def, records = [] }, i) => (
            <div className="role" key={i}>
              <h4>{role}</h4>
              <p>{def}</p>
              {records.map(({ name, url, title, affiliation, location }) => (
                <div className="record" key={name}>
                  <h5>
                    <a href={url} rel="noopener noreferrer" target="_blank">
                      {name}
                    </a>
                  </h5>
                  <div>{title}</div>
                  {affiliation && <div>{affiliation}</div>}
                  <div>{location}</div>
                </div>
              ))}
            </div>
          ))}
      </div>
    </CollapsibleSection>
  );
};

Acknowledgments.propTypes = {
  index: PropTypes.number,
  SectionTitle: PropTypes.string,
  Data: PropTypes.array,
};

export default Acknowledgments;
