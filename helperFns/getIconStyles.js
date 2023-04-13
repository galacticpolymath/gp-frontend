/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable no-multiple-empty-lines */


export const getIconStyles = (isHighlighted, sectionId) => {
    const isTeachingMaterialsId = sectionId === 'teaching_materials';
    const bgColor = isHighlighted ? (isTeachingMaterialsId ? '#cb1f8e' : 'rgba(44, 131, 195, 0.6)') : 'rgba(0,0,0,.1)';
    const borderColor = isHighlighted ? (isTeachingMaterialsId ? '#cb1f8e' : '#2c83c3') : (isTeachingMaterialsId ? '#cb1f8e' : '#bebebe');

    return (
        {
            backgroundColor: bgColor, height: '10px', width: '10px', borderRadius: '50%', display: 'inline-block', margin: '0 5px', border: '2px solid', borderColor: borderColor, padding: '4px', opacity: 1, transition: "all .15s ease-in", transitionProperty: "background-color, border-color",
        }
    );
};