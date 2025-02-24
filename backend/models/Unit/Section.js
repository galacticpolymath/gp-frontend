import mongoose from 'mongoose';

const { Schema, model } = mongoose;

export const UnitSectionPropsSchema = new Schema({
    __component: String,
    SectionTitle: String,
    sortOrder: Number,
    InitiallyExpanded: { type: Boolean, default: true }
});
const UnitSectionProps = model('UnitSectionProps', UnitSectionPropsSchema);

UnitSectionProps.discriminator('Section', new Schema({
    Content: String,
}, { discriminatorKey: 'kind' }));

export { UnitSectionProps }

