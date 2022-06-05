import { getMediaComponent } from './utils';

const Slide = ({
  type,
  title,
  lessonRelevance,
  by,
  byLink,
  mainLink,
}) => {
  return (
    <div>
      {getMediaComponent({ type, mainLink })}
      <div>
        <h5>{title}</h5>
        <p>{lessonRelevance}</p>
        <p>by
          <a
            href={byLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            {by}
          </a>
        </p>
      </div>
    </div>
  );
};

export default Slide;