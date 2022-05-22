import React from "react";
import PropTypes from "prop-types";

import StandardsGroup from "./StandardsGroup";

const Dimension = ({ name, standardsGroup }) => {
  return (
    <div className="Dimension">
      <p>
        <strong>Dimension:</strong> {name}
      </p>
      {standardsGroup.map((group, i) => (
        <StandardsGroup key={i} {...group} />
      ))}
    </div>
  );
};

Dimension.propTypes = {
  name: PropTypes.string,
  standardsGroup: PropTypes.array,
};

export default Dimension;
