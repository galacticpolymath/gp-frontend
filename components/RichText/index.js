import PropTypes from 'prop-types';

import CustomMarkdownView from './CustomMarkdownView';

import styles from './index.module.scss';

const RichText = ({ content, className = '', style = {}, sectionName }) => {

  if (!content) {
    return null;
  }
  let customCssClass = `${className}`;

  if (sectionName === 'Bonus_Content') {
    customCssClass = `${customCssClass} ${styles.Bonus_Content}`;
  }

  return (
    <CustomMarkdownView
      className={`${styles.RichText} ${customCssClass}`}
      style={style}
      markdown={content}
    />
  );
};

RichText.propTypes = {
  content: PropTypes.string,
  className: PropTypes.string,
};

export default RichText;
