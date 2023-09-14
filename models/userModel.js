import mongoose from "mongoose";

const userSchema = mongoose.Schema({

    // quickbloxId: {
    //     type: Number,
    //     unique: true,
    //     required: true,
    // },

    username: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    userType: {
        type: String,
        required: true,
        enum: ['local_company', 'user', 'freezone', 'factory', 'car', 'planes', 'sea_companies', 'news_agency', 'real_estate', 'trader', 'delivery_company'],

    },
    firstMobile: {
        type: String,
        required: true,
    },

    secondeMobile: {
        type: String,
    },
    thirdMobile: {
        type: String,
    },
    isFreeZoon: {
        type: Boolean,
    },
    isService: {
        type: Boolean,
    },
    isSelectable: {
        type: Boolean,
    },
    freezoneCity: String,
    deliverable: {
        type: Boolean,
    },
    subcategory: String,
    country: String,
    address: String,

    businessLicense: String,
    companyProductsNumber: Number,
    sellType: String,
    toCountry: String,
    profilePhoto: String,
    coverPhoto: String,
    banerPhoto: String,
    frontIdPhoto: String,
    backIdPhoto: String,
    bio: String,
    description: String,
    website: String,
    slogn: String,
    link: String,
    deliveryPermitPhoto: String,
    tradeLicensePhoto: String,
    isThereWarehouse: {
        type: Boolean,
    },
    isThereFoodsDelivery: {
        type: Boolean,
    },
    deliveryType: String,
    deliveryCarsNum: Number,
    deliveryMotorsNum: Number,
    vehicles: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vehicles',
            default: [],
        }
    ],
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Products',
            default: [],
        }
    ],
    selectedProducts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Products',
            default: [],
        }
    ],
    stripeCustomerId: {
        type: String,
    },
    cart: {
        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Products',
                    required: true
                },
                quantity: { type: Number, required: true }
            }
        ]
    },
    favorites: {
        products: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Products',
                },
            }
        ]
    },
    accounts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],

    followings: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: []
        },
    ],

    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: []
        },
    ],

    ratings: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            rating: { type: Number, required: true, min: 1, max: 5 }
        }
    ],
    totalRatings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    uniqueProfileVisitors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }],
    profileViews: {
        type: Number,
        default: 0
    },
    unreadNotifications: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Notifications',
            default: [],
        },
    ],

    subscriptionExpireDate: {
        type: Date,
    },
    realEstateListingsRemaining: { type: Number, default: 50 },
    advertisementsRemaining: { type: Number, default: 3 },
    carsListingsRemaining: { type: Number, default: 50 },
    planesListingsRemaining: { type: Number, default: 50 },
    profitRatio: {
        type: Number,
    },
    city: {
        type: String,
    },
    addressDetails: {
        type: String,
    },
    floorNum: {
        type: Number,
    },
    locationType: {
        type: String,
        enum: ['home', 'work']
    }


},
    {
        // Set the select option to exclude the password field by default
        toJSON: {
            select: '-password'
        }
    },
    { timestamps: true }
);

export default mongoose.model("User", userSchema);