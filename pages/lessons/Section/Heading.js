import React from 'react';
import PropTypes from 'prop-types';

const Heading = ({ index, SectionTitle }) => {
  return (
    <h2
      className="SectionHeading"
      id={SectionTitle.replace(/\s+/g, '_').toLowerCase()}
    >
      <div className="container">
        {index}. {SectionTitle}
      </div>
    </h2>
  );
};

Heading.propTypes = {
  index: PropTypes.number,
  SectionTitle: PropTypes.string,
};

export default Heading;
