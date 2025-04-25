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
import CopyableTxt from "../CopyableTxt";

export const CopyIcon = ({ color = "white" }) => (
    <svg
        style={{ color }}
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        className="bi bi-copy"
        viewBox="0 0 16 16"
    >
        <path
            fillRule="evenodd"
            d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"
        />
    </svg>
);
const IS_ON_PRODUCTION = process.env.NODE_ENV === 'production';
const BTN_TXT = "Check out this lesson!";

const ShareWidget = ({
    pinterestMedia,
    developmentUrl = typeof window !== 'undefined' ? window.location.href : '',
    shareWidgetStyle,
    widgetParentCss = 'share-widget gap-2 d-none d-md-flex position-fixed flex-column bg-white py-2 shadow start-0',
}) => {
    const url = IS_ON_PRODUCTION ? ((typeof window !== 'undefined') && window?.location?.href) : developmentUrl;

    const handleCopyLinkBtnClick = () => {
        navigator.clipboard.writeText(window.location.href)
    }

    return (
        <div style={shareWidgetStyle ?? {}} className={widgetParentCss}>
            <FacebookShareButton
                url={url}
                quote={BTN_TXT}
                hashtag={['#learning', "#GalacticPolymath"]}
            >
                <FacebookIcon size={32} round />
            </FacebookShareButton>
            <TwitterShareButton
                url={url}
                title={BTN_TXT}
                hashtag={['#learning', "#GalacticPolymath"]}
            >
                <TwitterIcon size={32} round />
            </TwitterShareButton>
            <PinterestShareButton
                url={url}
                media={pinterestMedia}
                description={BTN_TXT}
            >
                <PinterestIcon size={32} round />
            </PinterestShareButton>
            <EmailShareButton
                url={url}
                subject={BTN_TXT}
                body="Check out this lesson from Galactic Polymath!"
            >
                <EmailIcon size={32} round />
            </EmailShareButton>
            <div
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
                        <i
                            className="bi bi-clipboard text-white"
                        />
                    </button>
                </CopyableTxt>
            </div>
        </div>
    )
}
export default ShareWidget;