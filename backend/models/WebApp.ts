import { Model, Schema, models, model } from "mongoose";
import { IWebAppLink } from "../../types/global";


type TDbWebApp = Pick<IWebAppLink, "description" | "lessonIdStr" | "pathToFile" | "title" | "unitNumID" | "webAppLink" | "secondaryLink">;
let webApp = models.webApps as Model<TDbWebApp, {}, {}, {}, any, any>;

if(!webApp){   
    const WebAppSchema = new Schema<TDbWebApp>({
        lessonIdStr: String,
        unitNumID: { type: Number, ref: "Unit", default: null },
        webAppLink: String,
        title: String,
        pathToFile: String,
        secondaryLink: String,
        description: String
    })

    webApp = model("webApps", WebAppSchema);
}

export default webApp;