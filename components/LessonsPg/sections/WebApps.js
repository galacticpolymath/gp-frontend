 
 
/* eslint-disable react/jsx-key */
 
 
 
 

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