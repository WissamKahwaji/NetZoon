import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import otpGenerator from 'otp-generator'
import crypto from 'crypto';
import Nexmo from 'nexmo';
import mongoose from "mongoose";
import { Account } from '../models/account/account_model.js';


const nexmo = new Nexmo({
    apiKey: '7e88bc5b',
    apiSecret: '6W60UQDnogslVCuP'
});


const key = 'otp-secret-key';


export const signin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(404).json({
            success: false,
            message: "Invalid email or password",
        });
    }
    try {
        const existingUser = await userModel.findOne({ email });
        if (!existingUser) return res.status(401).json({ message: "User doesn't exist." });
        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) return res.status(401).json({ message: "Invalid credentials" });
        const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });
        res.status(200).json({ result: existingUser, message: 'LogIn Successfuled', token: token });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
}


export const changeAccount = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(404).json({
            success: false,
            message: "Invalid email or password",
        });
    }
    try {
        const existingUser = await userModel.findOne({ email, password: password });
        if (!existingUser) return res.status(401).json({ message: "User doesn't exist." });
        const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });
        res.status(200).json({ result: existingUser, message: 'LogIn Successfuled', token: token });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};




// Handle user registration
export const signUp = async (req, res) => {
    const { username, email, password, userType, firstMobile, secondeMobile, thirdMobile, isFreeZoon, deliverable, subcategory, address, businessLicense, companyProductsNumber, sellType, toCountry } = req.body;
    const profilePhoto = req.files['profilePhoto'][0];
    const bannerPhoto = req.files['bannerPhoto'] ? req.files['bannerPhoto'][0] : null;
    const coverPhoto = req.files['coverPhoto'][0];
    const frontIdPhoto = req.files['frontIdPhoto'] ? req.files['frontIdPhoto'][0] : null;
    const backIdPhoto = req.files['backIdPhoto'] ? req.files['backIdPhoto'][0] : null;


    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.json(error);
        }
        const profileUrlImage = 'https://net-zoon.onrender.com/' + profilePhoto.path.replace(/\\/g, '/');
        const coverUrlImage = 'https://net-zoon.onrender.com/' + coverPhoto.path.replace(/\\/g, '/');
        const banerUrlImage = bannerPhoto ? 'https://net-zoon.onrender.com/' + bannerPhoto.path.replace(/\\/g, '/') : null;
        const frontIdPhotoUrlImage = frontIdPhoto ? 'https://net-zoon.onrender.com/' + frontIdPhoto.path.replace(/\\/g, '/') : null;
        const backIdPhotoUrlImage = backIdPhoto ? 'https://net-zoon.onrender.com/' + backIdPhoto.path.replace(/\\/g, '/') : null;

        const existingUser = await userModel.findOne({ username });
        if (existingUser) {
            return res.status(422).json({ message: "User already exists, please login!" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        // Upload the profile photo and banner photo using multer

        // Get the uploaded banner photo filename

        const newUser = await userModel.create({
            username,
            email,
            password: hashedPassword,
            userType,
            firstMobile,
            secondeMobile,
            thirdMobile,
            isFreeZoon: isFreeZoon,
            deliverable: deliverable,
            subcategory,
            address,
            businessLicense,
            companyProductsNumber,
            sellType,
            toCountry,
            profilePhoto: profileUrlImage,
            coverPhoto: coverUrlImage,
            banerPhoto: banerUrlImage,
            frontIdPhoto: frontIdPhotoUrlImage,
            backIdPhoto: backIdPhotoUrlImage,
        });

        // const account = await Account.create({ user: newUser._id });
        // newUser.accounts.push(account._id);
        // await newUser.save();

        const token = jwt.sign({ email: newUser.email, id: newUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });

        res.status(201).json({
            result: newUser,
            message: "User created",
            token: token,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error in registration" });
    }
};

export const addAccount = async (req, res) => {
    const { email, username, password } = req.body;

    try {
        const existingUser = await userModel.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }


        const newUser = await userModel.findOne({ username });
        const isPasswordCorrect = await bcrypt.compare(password, newUser.password);
        if (!isPasswordCorrect) return res.status(401).json({ message: "Invalid credentials" });

        if (existingUser.accounts.includes(newUser._id)) {
            return res.status(409).json({ message: "User already has this account" });
        }

        // Create a new account and associate it with the user
        // const account = await Account.create({ user: existingUser._id });

        existingUser.accounts.push(newUser._id);
        newUser.accounts.push(existingUser._id);
        await existingUser.save();
        await newUser.save();
        res.status(201).json(existingUser);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error creating account" });
    }
};

export const getAccountByEmail = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await userModel.findOne({ email }).populate('accounts');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const accounts = user.accounts;

        res.status(200).json(accounts);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error retrieving accounts" });
    }
};

export const changePassword = async (req, res) => {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Invalid current password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json('Password changed successfully');
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error in changing password' });
    }
};


export const createOtp = async (params, callback) => {
    const otp = otpGenerator.generate(4, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
    });

    const ttl = 5 * 60 * 1000;
    const expires = Date.now() + ttl;
    const data = `${params.phone}.${otp}.${expires}`;
    const hash = crypto.createHmac("sha256", key).update(data).digest("hex");
    const fullHash = `${hash}.${expires}`;

    console.log(`Your Otp is ${otp}`);

    //Send SMS
    const from = '+971542451874';
    const to = '+971508426896';
    const text = 'Hello, this is a test SMS message!';
    nexmo.message.sendSms(from, to, text, (err, responseData) => {
        if (err) {
            console.log('Error:', err);
        } else {
            console.log('Message sent successfully:', responseData);
        }
    });

    return callback(null, fullHash);
};


export const verifyOTP = async (params, callback) => {
    let [hashValue, expires] = params.hash.split('.');

    let now = Date.now();
    if (now > parseInt(expires)) return callback('OTP expired');

    let data = `${params.phone}.${params.otp}.${expires}`;
    let newCalculateHash = crypto.createHmac('sha256', key).update(data).digest('hex');

    if (newCalculateHash === hashValue) {
        return callback(null, "Success");
    } else {
        return callback("Invalid OTP");
    }
};

export const otpLogin = async (req, res) => {

    createOtp(req.body, (error, results) => {
        if (error) {
            res.status(500).json({ message: "Error in registration" });
        }
        return res.status(200).json({
            message: "Success",
            data: results,
        });
    });


};

export const verifyOTPLogin = async (req, res) => {
    verifyOTP(req.body, (error, results) => {
        if (error) {
            return res.status(500).json({ message: "Invalid OTP" }); // Return the response and exit the function
        }
        return res.status(200).json({
            message: "Success",
            data: results,
        });
    });
};

export const addProductToFavorites = async (req, res) => {
    const { userId, productId } = req.body;

    try {
        console.error('11111111');
        // Find the user by userId
        const user = await userModel.findById(userId);
        console.error('22222222');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.error('3333333333');
        // Check if the product already exists in the favorites list
        const isProductInFavorites = user.favorites.products.find(
            (item) => item.productId.toString() === productId
        );
        console.error('4444444444');
        if (isProductInFavorites) {
            return res.status(400).json({ message: 'Product already in favorites' });
        }
        console.error('5555555555');
        // Add the product to the favorites list
        user.favorites.products.push({ productId });
        console.error('6666666666');
        // Save the updated user
        await user.save();

        res.status(200).json('Product added to favorites');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const removeProductFromFavorites = async (req, res) => {
    const { userId, productId } = req.body;

    try {
        // Find the user by userId
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the product exists in the favorites list
        const productIndex = user.favorites.products.findIndex(
            (item) => item.productId.toString() === productId
        );

        if (productIndex === -1) {
            return res.status(400).json({ message: 'Product not found in favorites' });
        }

        // Remove the product from the favorites list
        user.favorites.products.splice(productIndex, 1);

        // Save the updated user
        await user.save();

        res.status(200).json('Product removed from favorites');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const clearFav = async (req, res) => {

    const { userId } = req.body;

    try {
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.favorites.products = [];
        await user.save();

        return res.status(200).json('Favorites cleared');
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const getAllFavorites = async (req, res) => {
    const { userId } = req.params;

    try {
        // Find the user by userId and populate the favorite products
        const user = await userModel.findById(userId)
            .populate({
                path: 'favorites.products.productId',
                select: 'name imageUrl category description price',
                populate: { path: 'category', select: 'name' },
            })
            .exec();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Extract the favorite products from the user object
        const favoriteProducts = user.favorites.products.map((favorite) => {
            const { productId } = favorite;
            const { name, imageUrl, description, price, category } = productId;
            const categoryName = category ? category.name : null;

            return {
                productId: productId._id,
                name,
                imageUrl,
                description,
                price,
                category: categoryName,
            };
        });

        res.status(200).json(favoriteProducts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
export const getUserById = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getUserByType = async (req, res) => {
    const { userType } = req.body;
    try {
        const user = await userModel.find({ userType: userType });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const EditUser = async (req, res) => {
    const { userId } = req.params;
    const { username, email, firstMobile, secondeMobile, thirdMobile, subcategory, address, companyProductsNumber, sellType, toCountry } = req.body;
    let profileUrlImage;

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if a profile photo is included in the request
        if (req.files && req.files["profilePhoto"]) {
            const profilePhoto = req.files["profilePhoto"][0];
            profileUrlImage =
                "https://net-zoon.onrender.com/" +
                profilePhoto.path.replace(/\\/g, "/");
        }

        // Update the user fields
        user.username = username;
        user.email = email;
        user.firstMobile = firstMobile;
        user.secondeMobile = secondeMobile;
        user.thirdMobile = thirdMobile;
        user.subcategory = subcategory;
        user.address = address;
        user.companyProductsNumber = companyProductsNumber;
        user.sellType = sellType;
        user.toCountry = toCountry;

        // Update the profile photo only if it's included in the request
        if (profileUrlImage) {
            user.profilePhoto = profileUrlImage;
        }

        const updatedUser = await user.save();

        res.status(200).json("User Updated Successfully");
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getSelectedProducts = async (req, res) => {

    try {
        const { userId } = req.params;
        const user = await userModel.findById(userId).populate('selectedProducts').populate({
            path: 'selectedProducts',
            populate: [
                {
                    path: 'category',
                    select: 'name',
                },
                {
                    path: 'owner',
                    select: 'username userType',
                },
            ]
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const selectedProducts = user.selectedProducts;

        res.json(selectedProducts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const addProductsToSelectedProducts = async (req, res) => {
    try {
        const { userId } = req.params;
        const { productIds } = req.body;

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const productIdsArray = Array.isArray(productIds) ? productIds : [productIds];

        // let newProductIds;
        // if (productIds.length > 0) {
        //     newProductIds = productIds.filter(productId => !user.selectedProducts.includes(productId));
        // }

        // newProductIds = productIds;
        const newProductIds = productIdsArray.filter(productId => !user.selectedProducts.includes(productId));
        user.selectedProducts.push(...newProductIds);

        await user.save();

        res.json({ message: 'Products added to selectedProducts' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteProductFromSelectedProducts = async (req, res) => {
    try {
        const { userId, productId } = req.params;
        const user = await userModel.findById(userId);


        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove the product ID from the user's selectedProducts
        const index = user.selectedProducts.indexOf(productId);
        if (index !== -1) {
            user.selectedProducts.splice(index, 1);
        }

        // Save the updated user
        await user.save();

        res.json({ message: 'Product removed from selectedProducts' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }

};

export const toggleFollow = async (req, res) => {
    try {
        const { currentUserId } = req.body
        const otherUserId = req.params.otherUserId
        if (currentUserId === otherUserId) {
            return res.status(500).json({ msg: "You can't follow yourself!!!!!!!!" })
        }
        const currentUser = await userModel.findById(currentUserId)
        const otherUser = await userModel.findById(otherUserId)
        // if we don't follow user, we want to follow him, otherwise we unfollow him
        if (!currentUser.followings.includes(otherUserId)) {
            currentUser.followings.push(otherUserId)
            otherUser.followers.push(currentUserId)
            await currentUser.save()
            await otherUser.save()
            return res.status(200).json("You have successfully followed the user!")
        } else {
            currentUser.followings = currentUser.followings.pull(otherUserId)
            otherUser.followers = otherUser.followers.pull(currentUserId)
            await currentUser.save()
            await otherUser.save()
            return res.status(200).json("You have successfully unfollowed the user!")
        }
    } catch (error) {
        return res.status(500).json(error.message)
    }
};

export const getUserFollowings = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await userModel.findById(userId).populate('followings');
        res.status(200).json(user.followings);
    } catch (error) {
        return res.status(500).json(error.message)
    }

};

export const getUserFollowers = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await userModel.findById(userId).populate('followers');
        res.status(200).json(user.followers);
    } catch (error) {
        return res.status(500).json(error.message)
    }

}