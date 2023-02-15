/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable semi */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
const JobVizIcon = ({ isOnJobVizPg }) => {
    const imgContainerStyles = `${isOnJobVizPg ? 'jobVizImgContainerOnPg' : 'jobVizImgContainer'} rounded-circle border`;

    return (
        <div className={imgContainerStyles}>
            <img
                src=""
                alt="jobViz_Galactic_Polymath"
                className='jobVizImg'
            />
        </div>
    )
}

export default JobVizIcon;