import MailingListConfirmations from "../models/mailingListConfirmation";

export const deleteMailingListConfirmationsByEmail = async (email) => {
    try {
        const { deletedCount } = await MailingListConfirmations.deleteMany({ email });

        return deletedCount;
    } catch (error) {
        console.error("Failed to delete all. Reason: ", error);

        return null;
    }
}

export const findMailingListConfirmationByEmail = async (email) => {
    try {
        return await MailingListConfirmations.findOne({ email }).lean();
    } catch (error) {
        console.error("Failed to delete all. Reason: ", error);

        return null;
    }
}
export const findMailingListConfirmationsByEmails = async (emails) => {
    try {
        return await MailingListConfirmations.find({ emails: { $in: emails } }).lean();
    } catch (error) {
        console.error("Failed to delete all. Reason: ", error);

        return null;
    }
}