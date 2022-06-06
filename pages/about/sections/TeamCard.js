import React from 'react'
import Card from "../../../components/Card/Card";
import CardAvatar from "../../../components/Card/CardAvatar.js";
import CardBody from "../../../components/Card/CardBody.js";
import CardFooter from "../../../components/Card/CardFooter.js";
import teamStyle from "../../../components/Card/styles/teamStyle.js";
import { makeStyles } from "@material-ui/core/styles";


const useStyles = makeStyles(teamStyle);

function TeamCard() {
  const classes = useStyles();
  return (
    <div>
      <Card profile plain>
            <CardAvatar profile plain>
              {/* <img
                src={makeCloudinaryUrl(
                  "q_auto:best,f_auto,c_fill,g_face,w_300,h_300/v1592966233/Team/Matt_Wilkins_profile_ukorql.jpg"
                )}
                alt="profile-pic"
                className={classes.img}
              /> */}
            </CardAvatar>
            <CardBody plain>
              <h4 className={classes.cardTitle}>
                Matt Wilkins, PhD
              </h4>
              <h6 className={classes.textMuted}>
                Founder, CEO
              </h6>
              <p className={classes.cardDescription}>
                A scientist, teacher, writer, and pusher of boulders. Matt wants to live in a world where critical
                thinking and curiosity are as essential as breathing. Enjoys rock climbing, wildlife photography, and
                doing silly voices.
              </p>
            </CardBody>
            <CardFooter className={classes.justifyContent}>
              <button
                href="http://www.mattwilkinsbio.com/"
                target="_blank"
                justIcon
                simple
                color={"primary"}
              >
                <i className="fas fa-globe" />
              </button>
              <button
                href="https://github.com/drwilkins"
                target="_blank"
                justIcon
                simple
                color={"primary"}
              >
                <i className="fab fa-github" />
              </button>
              <button
                href="https://www.linkedin.com/in/mattwilkinsphd/"
                target="_blank"
                justIcon
                simple
                color={"primary"}
              >
                <i className="fab fa-linkedin" />
              </button>
              <button
                href="https://twitter.com/mattwilkinsbio"
                target="_blank"
                justIcon
                simple
                color={"primary"}
              >
                <i className="fab fa-twitter" />
              </button>
              <button
                href="https://scholar.google.com/citations?user=MZKGDvAAAAAJ&hl=en"
                target="_blank"
                justIcon
                simple
                color={"primary"}

              >
              </button>
            </CardFooter>
          </Card>
    </div>
  )
}

export default TeamCard