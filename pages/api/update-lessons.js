
export default async function handler(request, response) {
    try {

        const { filterObj, objKeysAndUpdatedValsArr } = request.body;

        if (!objKeysAndUpdatedValsArr) {
            return response.status(400).json({ msg: "The field 'objKeysAndUpdatedValsArr' must be present." });
        }

        if (!Array.isArray(areObjKeysAndUpdatedValsArrValid)) {
            return response.status(400).json({ msg: "The field 'objKeysAndUpdatedValsArr' must be an array." });
        }

        const areObjKeysAndUpdatedValsArrValid = objKeysAndUpdatedValsArr.every(keyAndVal => {
            if (!keyAndVal ||
                (((typeof keyAndVal === 'object') && (keyAndVal !== null)) && (!("key" in keyAndVal) || !("value" in keyAndVal)))
            ) {
                return false;
            }

            return true;
        })

        if (!areObjKeysAndUpdatedValsArrValid) {
            return response.status(400).json({ msg: "At least one object in 'objKeysAndUpdatedValsArr' array is invalid. Must have 'key' and 'value' field." });
        }


    } catch(error){
        const errMsg = `Something went wrong in updating the target lesson(s). Error message: ${error}`
        console.error(errMsg)

        return response.status(500).json({ msg: errMsg });
    }
}
