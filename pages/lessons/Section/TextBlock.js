import React from 'react';
import PropTypes from 'prop-types';

import RichText from '../../components/RichText';

const TextBlock = ({ Content }) => {
  return (
    <div className="container">
      <RichText content={Content} />
    </div>
  );
};

TextBlock.propTypes = {
  Content: PropTypes.string,
};

export default TextBlock;
