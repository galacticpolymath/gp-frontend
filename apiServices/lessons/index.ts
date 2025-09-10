import axios from "axios"

export const getUnitChildItems = async () => {
    try {
        return await axios.post("/api/gp-plus/get-unit-child-items")
    } catch(error){
        console.log("Failed to get unit child items: ", error);
        
        return null;
    }
}