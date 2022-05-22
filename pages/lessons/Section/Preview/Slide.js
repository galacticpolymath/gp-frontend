import React from 'react';
import classNames from 'classnames';


const Slide = ({
  type,
  title,
  lessonRelevance,
  by,
  byLink,
  mainLink,
}) => {
  let media;
  if (type === 'video') {
    media = (
      <iframe
        width="560"
        height="315"
        src={mainLink}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      >
      </iframe>
    );
  }

  return (null
  // <Box boxShadow={4} className={classNames('Slide', type, classes.card)}>
  //   {media}
  //   <div className="caption">
  //     <h5>{title}</h5>
  //     <p>{lessonRelevance}</p>
  //     <p>by <ExternalLink href={byLink}>{by}</ExternalLink></p>
  //   </div>
  // </Box>
  );
};

export default Slide;