/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable semi */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
import Image from "next/image";

const JobVizIcon = ({ isOnJobVizPg }) => {
    const imgContainerStyles = `${isOnJobVizPg ? 'jobVizImgContainerOnPg' : 'jobVizImgContainer'} rounded-circle`;
    const sizes = isOnJobVizPg ? '(max-width: 575px) 100px, (max-width: 767px) 130px, 170px' : '(max-width: 575px) 200px, 350px'

    return (
        <div className={`${imgContainerStyles} jobVizImg position-relative`}>
            <Image
                src="/imgs/jobViz/jobviz_icon.png"
                alt="jobViz_Galactic_Polymath"
                className="rounded-circle"
                fill
                sizes={sizes}
            />
        </div>
    )
}

export default JobVizIcon;