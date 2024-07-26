/* eslint-disable indent */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent */
const ORTxtDivider = ({ color = 'white', orWidth = '4%', firstLineWidth = "48%", secondLineWidth = "48%" }) => {
    return (
        <div className="d-flex mt-3 mb-2">
            <div style={{ width: firstLineWidth }} className='d-flex justify-content-center align-items-center'>
                <div style={{ height: "3px", width: '80%' }} className={`bg-${color} rounde`} />
            </div>
            <div style={{ width: orWidth }} className='d-flex justify-content-center align-items-center'>
                <span className={`text-${color}`}>OR</span>
            </div>
            <div style={{ width: secondLineWidth }} className='d-flex justify-content-center align-items-center'>
                <div style={{ height: "3px", width: '80%' }} className={`bg-${color} rounded`} />
            </div>
        </div>
    );
};

export default ORTxtDivider;