import { connectToMongodb } from "../../backend/utils/connection";

export default async function handler(_, response) {
    try{
        await connectToMongodb();
        
        return response.status(200).json({ msg: "This route is live!" })
    } catch(error){
        return response.status(500).json({ msg: `An error has occurred in the test connection route. Error message: ${error}.` })
    }
}