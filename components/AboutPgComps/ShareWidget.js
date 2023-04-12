/* eslint-disable react/no-children-prop */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable curly */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable no-unused-vars */
/* eslint-disable semi */
/* eslint-disable quotes */
/* eslint-disable no-console */
import {
    EmailShareButton,
    EmailIcon,
    FacebookShareButton,
    FacebookIcon,
    PinterestShareButton,
    PinterestIcon,
    TwitterShareButton,
    TwitterIcon,
} from "react-share";

const isOnProduction = process.env.NODE_ENV === 'production';

const ShareWidget = ({ pinterestMedia, isOnSide, developmentUrl }) => {
    const widgetDynamicCss = isOnSide ? 'd-none d-md-flex position-fixed flex-column bg-white py-2 shadow start-0' : 'd-flex d-md-none flex-row bg-transparent';
    const url = isOnProduction ? ((typeof window !== 'undefined') && window?.location?.href) : developmentUrl;
    const shareWidgetStyleOnSide = { borderTopRightRadius: '1rem', borderBottomRightRadius: '1rem', boxShadow: '0 4px 6px 0 rgba(0,0,0,.4), 0 7px 5px -5px rgba(0,0,0,.2)', top: 150, width: "60px" }
    const shareWidgetStyle = isOnSide ? shareWidgetStyleOnSide : {}

    return (
        <div style={shareWidgetStyle} className={`share-widget ${widgetDynamicCss}`}>
            <FacebookShareButton
                url={url}
                quote="Check out this lesson!"
                className="mx-1 my-md-1"
                hashtag={['#learning', "#GalacticPolymath"]}
            >
                <FacebookIcon size={32} round />
            </FacebookShareButton>
            <TwitterShareButton
                url={url}
                className="mx-1 my-md-1"
                title="Check out this lesson!"
                hashtag={['#learning', "#GalacticPolymath"]}
            >
                <TwitterIcon size={32} round />
            </TwitterShareButton>
            <PinterestShareButton
                url={url}
                className="mx-1 my-md-1"
                media={pinterestMedia}
                description="Check out this lesson!"
            >
                <PinterestIcon size={32} round />
            </PinterestShareButton>
            <EmailShareButton
                url={url}
                className="mx-1 my-md-1"
                subject="Check out this lesson!"
                body="Check out this lesson from Galactic Polymath!"
            >
                <EmailIcon size={32} round />
            </EmailShareButton>
        </div>
    )
}
export default ShareWidget;