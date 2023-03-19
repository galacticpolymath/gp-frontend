import { getMediaComponent } from './utils';

import styles from './index.module.scss';

const Slide = ({
  type,
  title,
  lessonRelevance,
  by,
  byLink,
  mainLink,
}) => {
  return (
    <div className='bg-white rounded p-3' style={{ 'width': '100%' }}>
      {getMediaComponent({ type, mainLink })}
      <div className={`${styles.SlideBody}`}>
        <h5>{title}</h5>
        <p>{lessonRelevance}</p>
        <span className="text-left">by{' '}
          <a
            href={byLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            {by}
          </a>
        </span>
      </div>
    </div>
  );
};

export default Slide;