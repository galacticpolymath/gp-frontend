/* eslint-disable quotes */
 
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable semi */
 
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