import mongoose, { Model, Schema } from "mongoose";
import { ISubscriptionSchema } from "../../types/schemaTypes";

const SubscriptionSchema: Schema<ISubscriptionSchema> = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // One who is subscribing
        ref: "User",
    },
    channel: {
        type: Schema.Types.ObjectId, // One to whom 'subscriber' is subscribing
        ref: "User",
    },
}, { timestamps: true });
const SubscriptionModel: Model<ISubscriptionSchema> = mongoose.model<ISubscriptionSchema>("Subscription", SubscriptionSchema);
export default SubscriptionModel;