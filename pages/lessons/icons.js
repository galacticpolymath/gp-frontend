import React from "react";

import GoogleDriveIcon from "assets/img/drive.svg";
import NearpodIcon from "assets/img/nearpod.svg";

/**
 * Please alphabetize. Wrap all icons with
 * <span role="img" aria-label="" />
 * for accessibility.
s */
const ICONS = {
  cards: (
    <span role="img" aria-label="cards">
      <i className="far fa-clone" style={{ fontSize: "1.3rem" }} />
    </span>
  ),
  computer: (
    <span role="img" aria-label="computer">
      <i className="fas fa-laptop" style={{ fontSize: "1.3rem" }} />
    </span>
  ),
  docx: (
    <span role="img" aria-label="word document">
      <i className="far fa-file-word" style={{ fontSize: "1.3rem" }} />
    </span>
  ),
  drive: (
    <span role="img" aria-label="google drive">
      <img
        src={GoogleDriveIcon}
        alt="Google Drive"
        style={{ width: "1.25rem", height: "1.25rem" }}
      />
    </span>
  ),
  edit: (
    <span role="img" aria-label="edit">
      <i className="far fa-edit" style={{ fontSize: "1.3rem" }} />
    </span>
  ),
  envelope: (
    <span role="img" aria-label="envelope">
      <i className="far fa-envelope" style={{ fontSize: "1.3rem" }} />
    </span>
  ),
  inPerson: (
    <span role="img" aria-label="in person">
      <i className="fas fa-chalkboard-teacher" style={{ fontSize: "1.3rem" }} />
    </span>
  ),
  internet: (
    <span role="img" aria-label="internet">
      <i className="fas fa-wifi" style={{ fontSize: "1.3rem" }} />
    </span>
  ),
  laptop: (
    <span role="img" aria-label="laptop">
      <i className="fas fa-laptop" style={{ fontSize: "1.3rem" }} />
    </span>
  ),
  nearpod: (
    <span role="img" aria-label="nearpod">
      <img
        src={NearpodIcon}
        alt="Nearpod"
        style={{ width: "1.25rem", height: "1.25rem", verticalAlign: "sub" }}
      />
    </span>
  ),
  pencil: (
    <span role="img" aria-label="pencil">
      <i className="far fa-edit" style={{ fontSize: "1.3rem" }} />
    </span>
  ),
  pdf: (
    <span role="img" aria-label="pdf">
      <i className="far fa-file-pdf" style={{ fontSize: "1.3rem" }} />
    </span>
  ),
  present: (
    <span role="img" aria-label="present">
      <i className="far fa-play-circle" style={{ fontSize: "1.1rem" }} />
    </span>
  ),
  projector: (
    <span role="img" aria-label="projector">
      <i className="fas fa-video" style={{ fontSize: "1.3rem" }} />
    </span>
  ),
  scissors: (
    <span role="img" aria-label="scissors">
      <i className="fas fa-cut" style={{ fontSize: "1.3rem" }} />
    </span>
  ),
  speaker: (
    <span role="img" aria-label="speakers">
      <i className="fas fa-volume-up" style={{ fontSize: "1.3rem" }} />
    </span>
  ),
  table: (
    <span role="img" aria-label="table">
      <i className="fas fa-table" style={{ fontSize: "1.3rem" }} />
    </span>
  ),
  video: (
    <span role="img" aria-label="video">
      <i className="fas fa-video" style={{ fontSize: "1.3rem" }} />
    </span>
  ),
  wifi: (
    <span role="img" aria-label="wifi">
      <i className="fas fa-wifi" style={{ fontSize: "1.3rem" }} />
    </span>
  ),
  worksheet: (
    <span role="img" aria-label="worksheet">
      <i className="far fa-file-alt" style={{ fontSize: "1.3rem" }} />
    </span>
  ),
};

export const getIcon = (slug) => {
  if (!slug) {
    return null;
  }
  for (const ICON_NAME in ICONS) {
    if (slug.match(new RegExp(ICON_NAME, "gi"))) return ICONS[ICON_NAME];
  }
  return null;
};

export default ICONS;
