import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
// import { makeStyles } from '@material-ui/core/styles';

// import GridContainer from 'components/Grid/GridContainer';
// import Card from 'components/Card/Card.js';
// import GridItem from 'components/Grid/GridItem';
// import Image from '../../../components/StrapiImage';
// import TagCloud from '../../../components/TagCloud';
// import RichText from '../../../components/RichText';
// import AnchorLink from 'react-anchor-link-smooth-scroll';

// Material UI Icons
// import FaceIcon from '@material-ui/icons/Face';
// import MenuBookIcon from '@material-ui/icons/MenuBook';
// import ScheduleIcon from '@material-ui/icons/Schedule';

// import lessonPlanStyle from 'assets/jss/material-kit-pro-react/views/lessonPlanStyle.js';
import CollapsibleSection from './CollapsibleSection';

// const useStyles = makeStyles(lessonPlanStyle);

const Overview = ({
  index,
  Description,
  EstLessonTime,
  ForGrades,
  TargetSubject,
  SteamEpaulette,
  Text,
  Tags,
}) => {
  const classes = {};// useStyles();

  return (
    <CollapsibleSection
      className="Overview"
      index={index}
      SectionTitle="Overview"
      initiallyExpanded
    >
      <div className={classes.container}>
        {/* <Card className="stats">
          <GridContainer className="tiles">
            <GridItem className=" focus" id="firstGridItem">

              <MenuBookIcon fontSize="large" className="statIcon" />
              <h5>Target Subject: </h5>
              <div className="statContainer">
                <h3>{TargetSubject}</h3>
              </div>
            </GridItem>
            <GridItem className=" focus">
              <FaceIcon fontSize="large" className="statIcon" />
              <h5>Grades: </h5>
              <div className="statContainer">
                <h3>{ForGrades}</h3>
              </div>
            </GridItem>
            <GridItem className="focus">
              <ScheduleIcon fontSize="large" className="statIcon" />
              <h5>Estimated Time: </h5>
              <div className="statContainer" id="lastGridItem">
                <h3>{EstLessonTime}</h3>
              </div>
            </GridItem>
          </GridContainer>
          <AnchorLink href="#learning_standards" offset="125px">
            <div className="epaulette-container">
              <h5>Subject breakdown by standard alignments: </h5>
              <Image {...SteamEpaulette} className="epaulette" />
            </div>
          </AnchorLink>


        </Card>

        <RichText content={Text} />

        <h5>Keywords:</h5>
        {Tags && <TagCloud tags={Tags} />}

        {Description &&
          <Fragment>
            <h3>Lesson Description</h3>
            <RichText content={Description} />
          </Fragment>
        } */}
      </div>
    </CollapsibleSection>
  );
};

Overview.propTypes = {
  index: PropTypes.number,
  EstLessonTime: PropTypes.string,
  ForGrades: PropTypes.string,
  TargetSubject: PropTypes.string,
  SteamEpaulette: PropTypes.object,
  Text: PropTypes.string,
  Tags: PropTypes.array,
};

export default Overview;
