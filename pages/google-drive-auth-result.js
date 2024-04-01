/* eslint-disable no-console */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable semi */
/* eslint-disable indent */
import Layout from "../components/Layout"
import { createObj } from "../globalFns";
import { Cookies } from "../globalClasses";

const getAccessTokenObjFromUrl = url => {
    const tokenInfoStr = url.split('#').at(-1)
    let tokenAttributes = tokenInfoStr.split('&')
    tokenAttributes = tokenAttributes.map(tokenAttribute => tokenAttribute.split('='))

    return createObj(tokenAttributes)
}

const GoogleDriveAuthResult = () => {
    if (typeof window !== 'undefined') {
        const cookies = new Cookies();
        const accessTokenObj = getAccessTokenObjFromUrl(window.location.href);
        const expiresIn = new Date().getTime() + (parseInt(accessTokenObj.expires_in) * 1_000)

        Object.entries(accessTokenObj).forEach(([key, val]) => {
            cookies.set(key, val, expiresIn)
        })
    }

    return (
        <Layout>
            <div className='min-vh-100 pt-3 ps-3'>
                <span>
                    GP now has access to your google drive!
                </span>
            </div>
        </Layout>
    )
};

export default GoogleDriveAuthResult;