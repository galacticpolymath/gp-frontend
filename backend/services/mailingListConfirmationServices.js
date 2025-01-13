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