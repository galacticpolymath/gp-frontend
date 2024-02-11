/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
// import Image from 'next/image';
import CardTitle from '../LessonsPg/CardTitle';
import { getMediaComponent } from '../LessonSection/Preview/utils';

const VideoCard = ({
    videoObj,
    cardClassName = 'py-3 px-4 w-100 pointer disable-underline-a-tags g-col-sm-12 g-col-md-6 g-col-lg-6 g-col-xl-4 mx-auto d-grid bg-white rounded-3 lessonsPgShadow',
    style = {},
}) => {
    // console.log(videoObj.mainLink);
    return (
        <div style={style} className={cardClassName}>
            <div className="bg-danger">
                <div
                    style={{ position: 'relative', height: '155px', objectFit: 'fill' }}
                    className='px-1 mediaItemContainer'
                >
                    {getMediaComponent({ type: 'video', mainLink: videoObj.mainLink })}
                </div>
            </div>
            <div className="w-100">
                <CardTitle
                    title={videoObj.videoTitle}
                    className='mt-1 vid-card-heading-txt w-light text-black mb-0 no-underline-on-hover'
                />
            </div>
            <div style={{ width: '100%' }}>
                <div
                    className='ellipsize-txt-5'
                >
                    {videoObj?.description}
                </div>
            </div>
        </div>
    );
};

export default VideoCard;