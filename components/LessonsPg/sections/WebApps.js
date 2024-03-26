/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-key */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable semi */
/* eslint-disable no-console */
/* eslint-disable quotes */

import WebAppCard from "../WebAppCard"

const WebAppsSection = ({ webApps, handleGpWebAppCardClick }) => {
    return (
        webApps?.length ?
            webApps.map(webApp => <WebAppCard handleGpWebAppCardClick={handleGpWebAppCardClick} webApp={webApp} />)
            :
            null
    );
};

export default WebAppsSection;