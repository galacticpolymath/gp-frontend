import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import TimerIcon from "@material-ui/icons/Timer";

import lessonPlanStyle from "assets/jss/material-kit-pro-react/views/lessonPlanStyle.js";
import RichText from "components/RichText";
import CollapsibleSection from "../CollapsibleSection";
import LessonPart from "./LessonPart";

import "./style.scss";
const useStyles = makeStyles(lessonPlanStyle);

const Procedure = ({ index, SectionTitle, Data }) => {
  const classes = useStyles();
  return (
    <CollapsibleSection
      className="Procedure"
      index={index}
      SectionTitle={SectionTitle}
      initiallyExpanded
    >
      <div className={classes.container}>
        <Fragment>
          <div className={classes.procLessonPreface}>
            <h4>
              <TimerIcon className={classes.inlineIcon} />
              {"  "}
              {Data.lessonDur}
            </h4>
            <RichText content={Data.lessonPreface} />
          </div>
          {Data.parts.map((part, i) => (
            <LessonPart key={i} {...part} />
          ))}
        </Fragment>
      </div>
    </CollapsibleSection>
  );
};

Procedure.propTypes = {
  index: PropTypes.number,
  SectionTitle: PropTypes.string,
  Data: PropTypes.object,
};

export default Procedure;
