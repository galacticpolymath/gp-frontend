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
import { FaRegCopy } from 'react-icons/fa'
import CopyableTxt from "../CopyableTxt";

const isOnProduction = process.env.NODE_ENV === 'production';

const ShareWidget = ({
    pinterestMedia,
    developmentUrl,
    shareWidgetStyle = {},
    widgetParentCss = 'share-widget gap-2 d-none d-md-flex position-fixed flex-column bg-white py-2 shadow start-0',
}) => {
    const url = isOnProduction ? ((typeof window !== 'undefined') && window?.location?.href) : developmentUrl;

    const handleCopyLinkBtnClick = () => {
        navigator.clipboard.writeText(window.location.href)
    }

    return (
        <div style={shareWidgetStyle} className={widgetParentCss}>
            <FacebookShareButton
                url={url}
                quote="Check out this lesson!"
                // className="mx-md-1"
                hashtag={['#learning', "#GalacticPolymath"]}
            >
                <FacebookIcon size={32} round />
            </FacebookShareButton>
            <TwitterShareButton
                url={url}
                // className="mx-md-1"
                // style={{ minWidth: "40px" }}
                title="Check out this lesson!"
                hashtag={['#learning', "#GalacticPolymath"]}
            >
                <TwitterIcon size={32} round />
            </TwitterShareButton>
            <PinterestShareButton
                url={url}
                // className="mx-md-1"
                // style={{ minWidth: "40px" }}
                media={pinterestMedia}
                description="Check out this lesson!"
            >
                <PinterestIcon size={32} round />
            </PinterestShareButton>
            <EmailShareButton
                url={url}
                // className="mx-md-1"
                // style={{ minWidth: "40px" }}
                subject="Check out this lesson!"
                body="Check out this lesson from Galactic Polymath!"
            >
                <EmailIcon size={32} round />
            </EmailShareButton>
            <div
                // style={{ minWidth: '40px' }}
                className='d-flex justify-content-center align-items-center'
            >
                <CopyableTxt
                    copyTxtIndicator="Copy link to lesson."
                    txtCopiedIndicator="Link copied ✅!"
                    implementLogicOnClick={handleCopyLinkBtnClick}
                    copyTxtModalDefaultStyleObj={{
                        position: 'fixed',
                        width: '128px',
                        backgroundColor: '#212529',
                        textAlign: 'center',
                    }}
                >
                    <button
                        style={{
                            background: "#7F7F7F",
                            border: 'none',
                            width: 32, height: 32,
                        }}
                        className='d-flex justify-content-center align-items-center rounded-circle'
                    >
                        <FaRegCopy color='white' />
                    </button>
                </CopyableTxt>
            </div>
        </div>
    )
}
export default ShareWidget;