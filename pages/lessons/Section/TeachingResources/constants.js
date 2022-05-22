import React from "react";

import SchoolIcon from "@material-ui/icons/School";
import RemoteIcon from "@material-ui/icons/Laptop";

export const METHODS = {
  REMOTE: "remote",
  IN_PERSON: "in_person",
};

export const TITLES = {
  [METHODS.REMOTE]: "Remote Teaching Materials",
  [METHODS.IN_PERSON]: "Classroom/In-person Teaching Materials",
};

export const COPY = {
  [METHODS.REMOTE]: (
    <p>
      All you need to teach the lesson remotely, using the Nearpod platform.
      This version can be taught in a teacher-paced format (over a live video
      call) or a student-paced format (where students work independently).
      Either version can also be used in an in-person classroom setting, and the
      student-paced version is great for a substitute teacher to run a rigorous
      lesson you had intended to teach in person.
    </p>
  ),
  [METHODS.IN_PERSON]: (
    <p>
      Everything you need to teach the lesson in person. Classroom lessons are
      designed to be led by a teacher, who will actively moderate discussions.
      Students will record their observations and reflections on printed
      handouts, as opposed to the remote version, where students respond
      digitally to embedded questions using Nearpod on their laptop.
    </p>
  ),
};

export const ICONS = {
  [METHODS.REMOTE]: <RemoteIcon />,
  [METHODS.IN_PERSON]: <SchoolIcon />,
};
