/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
// import Image from 'next/image';
import CardTitle from '../LessonsPg/CardTitle';
import { getMediaComponent } from '../LessonSection/Preview/utils';
import EllipsisTxt from '../Text/EllipsisTxt';
import CustomLink from '../CustomLink';

const VideoCard = ({
    videoObj,
    cardClassName = 'd-flex flex-column justify-content-between py-3 px-4 position-relative w-100 pointer g-col-sm-12 g-col-md-6 g-col-lg-6 g-col-xl-4 mx-auto d-grid rounded-3 bg-white lessonsPgShadow',
    style = {},
}) => {
    // if not part of a lesson for unit, then take the user to the lesson itself
    let hrefStr = `/lessons/en-US/${videoObj.lessonUnitNumId}`;

    if (videoObj.lessonNum) {
        // if the there is a lesson number, then add that to the url
        console.log('videoObj.lessonNum: ', videoObj.lessonNum);
    }

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
                {videoObj?.description && (
                    <EllipsisTxt ellipsisTxtNum={2} style={{ marginTop: '6px' }}>
                        {videoObj?.description}
                    </EllipsisTxt>
                )}
            </div>
            <CustomLink
                color='#BFBFBF'
                className='no-link-decoration mt-3'
                hrefStr={hrefStr}
                style={{ lineHeight: '22px' }}
            >
                {videoObj.lessonNum ?
                    <span className="underline-on-hover">
                        for Lesson {videoObj.lessonNum} of <i>{videoObj.lessonUnitTitle}</i>
                    </span>
                    :
                    <span>part of <i>{videoObj.lessonUnitTitle}</i> unit.</span>
                }
            </CustomLink>
        </div>
    );
};

export default VideoCard;