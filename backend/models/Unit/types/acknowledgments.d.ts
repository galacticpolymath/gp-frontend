import { IUnitSectionObj } from "../Section";

interface IRecord {
    name: string;
    url: string;
    title: string;
    affiliation: string;
    location: string;
}

interface IAcknowledgementsData {
    role: string;
    def: string;
    records: IRecord[];
}

type TAcknowledgments = {
    Data: IAcknowledgementsData[]
} & IUnitSectionObj