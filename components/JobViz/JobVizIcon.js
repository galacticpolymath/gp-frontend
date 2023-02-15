/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable semi */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
const JobVizIcon = ({ isOnJobVizPg }) => {
    const imgContainerStyles = `${isOnJobVizPg ? 'jobVizImgContainerOnPg' : 'jobVizImgContainer'} rounded-circle`;

    return (
        <div className={imgContainerStyles}>
            <img
                src="/imgs/jobViz/jobviz_icon.png"
                alt="jobViz_Galactic_Polymath"
                className='jobVizImg rounded-circle'
            />
        </div>
    )
}

export default JobVizIcon;