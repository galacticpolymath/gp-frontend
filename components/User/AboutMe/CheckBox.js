/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
const CheckBox = ({ value, fieldToUpdate, handleCheckboxInputChange }) => {
    return (
        <input
            type='checkbox'
            name='subject'
            value={value}
            onChange={handleCheckboxInputChange}
        />
    );
};

export default CheckBox;