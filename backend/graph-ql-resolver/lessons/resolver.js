import { lesson } from "./schema";

export const resolvers = {
    Query: {
        lesson: () => lesson,
    },
};