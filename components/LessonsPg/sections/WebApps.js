/* eslint-disable indent */
 
/* eslint-disable react/jsx-key */
 
/* eslint-disable semi */
 
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