import React from 'react';
import PropTypes from 'prop-types';

import CustomMarkdownView from './CustomMarkdownView';

import styles from './index.module.scss';

const RichText = ({ content, className = '' }) => {
  if (!content) {
    return null;
  }

  return (
    <CustomMarkdownView
      className={`${styles.RichText} ${className}`}
      markdown={content}
    />
  );
};

RichText.propTypes = {
  content: PropTypes.string,
  className: PropTypes.string,
};

export default RichText;
