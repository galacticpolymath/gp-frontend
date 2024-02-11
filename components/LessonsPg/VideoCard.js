/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
// import Image from 'next/image';
import CardTitle from '../LessonsPg/CardTitle';
import { getMediaComponent } from '../LessonSection/Preview/utils';
import EllipsisTxt from '../Text/EllipsisTxt';

const VideoCard = ({
    videoObj,
    cardClassName = 'py-3 px-4 w-100 pointer disable-underline-a-tags g-col-sm-12 g-col-md-6 g-col-lg-6 g-col-xl-4 mx-auto d-grid bg-white rounded-3 lessonsPgShadow',
    style = {},
}) => {
    return (
        <div style={style} className={cardClassName}>
            <div>
                <div
                    style={{ position: 'relative', height: '160px' }}
                    className='px-1 video-iframe-on-card'
                >
                    {getMediaComponent({ type: 'video', mainLink: videoObj.mainLink })}
                </div>
                <CardTitle
                    title={videoObj.videoTitle}
                    className='mt-3 vid-card-heading-txt w-light text-black mb-0 no-underline-on-hover'
                />
                <EllipsisTxt ellipsisTxtNum={2} style={{ marginTop: '6px' }}>
                    {videoObj?.description}
                </EllipsisTxt>
            </div>
        </div>
    );
};

export default VideoCard;