import mongoose from "mongoose";

const advertisementSchema = mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    purchasable: Boolean,
    advertisingTitle: {
        type: String,
        required: true,
    },
    advertisingStartDate: {
        type: String,
        required: true,
    },
    advertisingEndDate: {
        type: String,
        required: true,
    },
    advertisingDescription: {
        type: String,
        required: true,
    },
    advertisingImage: {
        type: String,
        required: true,
    },
    advertisingCountryAlphaCode: {
        type: String,
    },

    advertisingBrand: {
        type: String,

    },
    advertisingViews: {
        type: Number,

    },
    advertisingYear: {
        type: String,
        required: true,
    },
    advertisingLocation: {
        type: String,
        required: true,
    },
    advertisingPrice: {
        type: Number,
        required: true,
    },
    advertisingImageList: [{ type: String }],
    advertisingVedio: String,
    advertisingType: {
        type: String,
        required: true,
    },

}, { timestamps: true });




export const Advertisement = mongoose.model('Advertisements', advertisementSchema);