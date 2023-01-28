/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable quotes */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable no-console */
/* eslint-disable react/jsx-first-prop-new-line */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable semi */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */

import ReactPlayer from "react-player";

const VideoPlayer = () => (
    <div className="video-styles rounded overflow-hidden">
        <ReactPlayer
            url='https://www.youtube.com/watch?v=V0EtA5pbVSY'
            width='100%'
            height="100%"
            light
            playing
            controls />
    </div>
)

export default VideoPlayer;