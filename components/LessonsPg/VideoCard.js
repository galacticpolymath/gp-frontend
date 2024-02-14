/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
// import Image from 'next/image';
import CardTitle from '../LessonsPg/CardTitle';
import EllipsisTxt from '../Text/EllipsisTxt';
import CustomLink from '../CustomLink';
import { getMediaComponent as Thumbnail } from '../LessonSection/Preview/utils';

const VideoCard = ({
    videoObj,
    setSelectedVideo,
    setIsModalShown,
    cardClassName = 'd-flex flex-column justify-content-between py-3 px-4 position-relative w-100 pointer g-col-sm-12 g-col-md-6 g-col-lg-6 g-col-xl-4 mx-auto d-grid rounded-3 bg-white lessonsPgShadow',
    style = {},
}) => {
    // if not part of a lesson for unit, then take the user to the lesson itself
    let hrefStr = `/lessons/en-US/${videoObj.lessonUnitNumId}`;

    const handleOnClick = ({ mainLink, description, videoTitle, lessonUnitTitle }) => () => {
        setSelectedVideo({ link: mainLink, description: description, title: videoTitle, unitTitle: lessonUnitTitle });
        setIsModalShown(true);
    };

    return (
        <div style={style} className={cardClassName}>
            <div>
                <div
                    style={{ height: '160px' }}
                    className='video-iframe-on-card'
                >
                    {/* {getMediaComponent({ type: 'video', mainLink: videoObj.mainLink, handleOnClick: handleOnClick })} */}
                    <Thumbnail
                        type="video"
                        mainLink={videoObj.mainLink}
                        iframeStyle={{ zIndex: 100, width: '100%', height: '100%', position: 'absolute' }}
                    />
                    <div
                        onClick={handleOnClick(videoObj)}
                        style={{ zIndex: 101 }}
                        className='position-absolute w-100 h-100'
                    />
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
                className='no-link-decoration mt-3 underline-on-hover'
                hrefStr={hrefStr}
                style={{ lineHeight: '22px' }}
            >
                {videoObj.lessonNum ?
                    <>
                        for Lesson {videoObj.lessonNum} of <em>{videoObj.lessonUnitTitle}</em>.
                    </>
                    :
                    <>part of <i>{videoObj.lessonUnitTitle}</i>.</>
                }
            </CustomLink>
        </div>
    );
};

export default VideoCard;