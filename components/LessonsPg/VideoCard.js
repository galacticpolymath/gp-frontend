/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
// import Image from 'next/image';
import CardTitle from '../LessonsPg/CardTitle';
import { getMediaComponent } from '../LessonSection/Preview/utils';

const VideoCard = ({
    videoObj,
    cardClassName = 'py-3 px-4 w-100 pointer disable-underline-a-tags g-col-sm-12 g-col-md-6 g-col-lg-6 g-col-xl-4 mx-auto d-grid bg-white rounded-3 lessonsPgShadow cardsOnLessonPg',
    style = {},
}) => {
    // console.log(videoObj.mainLink);
    return (
        <div style={style} className={cardClassName}>
            <div
                style={{ position: 'relative', height: '175px', objectFit: 'fill' }}
                className='px-1 mediaItemContainer'
            >
                {getMediaComponent({ type: 'video', mainLink: videoObj.mainLink })}
            </div>
            <div className="w-100">
                <CardTitle
                    title={videoObj.videoTitle}
                    className='mt-1 w-75 vid-card-heading-txt w-light text-black mb-0 no-underline-on-hover'
                />
                <div style={{ height: '80px', overflow: 'hidden' }}>
                    <span className="w-75 bg-danger d-block" style={{ wordWrap: 'break-word' }}>
                        {videoObj.description}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default VideoCard;