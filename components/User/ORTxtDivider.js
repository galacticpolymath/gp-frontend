/* eslint-disable indent */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent */
const ORTxtDivider = () => {
    return (
        <div className="d-flex mt-3 mb-2">
            <div style={{ width: "48%" }} className='d-flex justify-content-center align-items-center'>
                <div style={{ height: "3px", width: '80%' }} className="bg-white rounded" />
            </div>
            <div style={{ width: "4%" }} className='d-flex justify-content-center align-items-center'>
                <span className="text-white">OR</span>
            </div>
            <div style={{ width: "48%" }} className='d-flex justify-content-center align-items-center'>
                <div style={{ height: "3px", width: '80%' }} className="bg-white rounded" />
            </div>
        </div>
    );
};

export default ORTxtDivider;