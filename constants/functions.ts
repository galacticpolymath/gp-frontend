export const createDbProjections = (fields: string[]) => {
    return fields.reduce((dbProjections, field) => {
        return {
            ...dbProjections,
            [field]: 1
        };
    }, {});
}