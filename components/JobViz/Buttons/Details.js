/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/jsx-tag-spacing */
/* eslint-disable quotes */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable semi */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-no-undef */

import { useRouter } from "next/router"
import { Button } from "react-bootstrap"
import { IoNewspaperOutline } from "react-icons/io5"
import { getJobCategoryIds } from "../../../helperFns/getJobCategoryIds"

const Details = ({ jobToShowInModal, setSelectedJob, id }) => {
    const router = useRouter()

    const handleBtnClick = () => {
        const [currentHierarchyNum, currentLevel] = router.query['search-results'];
        const jobCategoryIdPaths = getJobCategoryIds(router.query['search-results'], jobToShowInModal.id.toString())
        const pathUpdated = `/jobviz/${currentHierarchyNum}/${currentLevel}/${jobCategoryIdPaths.join('/')}`
        router.push({ pathname: pathUpdated }, null, { scroll: false })
        setSelectedJob(jobToShowInModal)
    }

    return (
        <Button
            id={id}
            className="d-flex justify-content-center align-items-center job-categories-btn"
            onClick={handleBtnClick}
        >
            <span className="w-25 h-100 d-flex justify-content-center align-items-center">
                <IoNewspaperOutline />
            </span>
            <span className="w-75 h-100 d-flex justify-content-center align-items-center ps-1">
                Details
            </span>
        </Button>
    )
}

export default Details;
