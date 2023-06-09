import { Departments } from "../../models/product/departmenst/departmenst_model.js";
import { DepartmentsCategory } from "../../models/product/departmenst/categories/departments_categories_model.js";
import { Product } from "../../models/product/product.js";
import { deleteFile } from '../../utils/file.js';
import mongoose from "mongoose";
import userModel from "../../models/userModel.js";
// import upload from "../../middlewares/upload.js";
// import multer from "multer";

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('category', 'name').populate('owner', 'username userType');
        return res.json(products);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getProductById = async (req, res) => {
    const { productId } = req.params;
    try {
        const product = await Product.findById(productId).populate('category', 'name').populate('owner', 'username');
        return res.json(product);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getCategoriesByDepartment = async (req, res) => {
    try {

        const { department } = req.body;
        const departmentres = await Departments.findOne({
            name: department
        }).populate('departmentsCategory');
        if (!departmentres) {
            return res.status(404).json({ message: 'no Data Found' });
        }
        const categories = await departmentres.departmentsCategory;
        if (categories) {
            return res.json({
                message: "success",
                results: categories,
            });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });

    }
}

export const getProductsByCategory = async (req, res) => {
    try {

        const { department, category } = req.body;

        await Product.find();

        const departments = await Departments.findOne({ name: department });
        if (!departments) {
            return res.status(404).json({ message: `Department ${department} not found` });
        }
        console.log(departments._id);
        // const categories = await DepartmentsCategory.findOne({ name: category, department: departments._id }).populate('products').populate({
        //     path: 'products',
        //     populate: {
        //         path: 'category',
        //         select: 'name',
        //     },
        // });
        const categories = await DepartmentsCategory.findOne({ name: category, department: departments._id })
            .populate({
                path: 'products',
                populate: [
                    {
                        path: 'category',
                        select: 'name',
                    },
                    {
                        path: 'owner',
                        select: 'username',
                    },
                ],
            });
        console.log(categories);
        if (!categories) {
            return res.status(404).json({ message: `Category ${category} not found in department ${department}` });
        }
        categories.products.category = category;
        const products = await categories.products;

        if (products) {
            return res.json({
                message: "success",
                department,
                category,
                results: products,
            });
        } else {
            res.status(404).send(`Category ${category} not found in department ${department}`);

        }
    } catch (error) {
        return res.status(500).json({ message: error.message });

    }
};

export const addProduct = async (req, res) => {
    try {
        const { departmentName, categoryName } = req.body;
        const { owner, name, condition, description, price, quantity, guarantee, address, madeIn, year, discountPercentage } = req.body;
        const image = req.files['image'][0];

        const ownerId = new mongoose.Types.ObjectId(owner);
        // const existingUser = await userModel.findOne({ _id: ownerId });
        // if (!existingUser) {
        //     return res.status(500).json({ message: "User don't exists" });
        // }
        if (!image) {
            return res.status(404).json({ message: 'Attached file is not an image.' });
        }

        const urlImage = 'https://net-zoon.onrender.com/' + image.path.replace(/\\/g, '/');



        // Find department by name
        const department = await Departments.findOne({ name: departmentName });
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        // Find category by name and department
        const category = await DepartmentsCategory.findOne({ name: categoryName, department: department._id });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        let discountedPrice = price;
        if (discountPercentage && discountPercentage >= 1 && discountPercentage <= 100) {
            const discount = price * (discountPercentage / 100);
            discountedPrice = price - discount;
        }

        const productData = {
            owner: ownerId, // assuming user is authenticated and req.user contains user information
            name,
            imageUrl: urlImage,
            category: category._id,
            condition: condition,
            description,
            price,
            quantity,
            guarantee,
            address,
            madeIn,
            year,
            discountPercentage,
            priceAfterDiscount: discountedPrice,
        };

        if (req.files['productimages']) {
            const productImages = req.files['productimages'];
            const imageUrls = [];
            if (!productImages || !Array.isArray(productImages)) {
                return res.status(404).json({ message: 'Attached files are missing or invalid.' });
            }

            for (const image of productImages) {
                if (!image) {
                    return res.status(404).json({ message: 'Attached file is not an image.' });
                }

                const imageUrl = 'https://net-zoon.onrender.com/' + image.path.replace(/\\/g, '/');
                imageUrls.push(imageUrl);
                productData.images = imageUrls;
            }
        }

        // Add optional fields if they exist
        if (req.files['video']) {
            const video = req.files['video'][0];
            const urlVideo = 'https://net-zoon.onrender.com/' + video.path.replace(/\\/g, '/');
            productData.vedioUrl = urlVideo;
        }

        if (req.files['gif']) {
            const gif = req.files['gif'][0];
            const gifUrl = 'https://net-zoon.onrender.com/' + gif.path.replace(/\\/g, '/');
            productData.gifUrl = gifUrl;
        }

        const product = new Product(productData);
        const savedProduct = await product.save();

        category.products.push(savedProduct._id);
        await category.save();

        return res.status(201).json(savedProduct._id);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error });
    }
};

export const editProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const { name, description, price, guarantee, address, madeIn, year } = req.body;
        let urlImage;
        if (req.files && req.files["image"]) {
            const profilePhoto = req.files["image"][0];
            urlImage =
                "https://net-zoon.onrender.com/" +
                profilePhoto.path.replace(/\\/g, "/");
        }
        // const image = req.files['image'][0];
        // if (!image) {
        //     return res.status(404).json({ message: 'Attached file is not an image.' });
        // }

        // const urlImage = 'https://net-zoon.onrender.com/' + image.path.replace(/\\/g, '/');
        let updatedProduct;
        if (req.files && req.files["image"]) {
            updatedProduct = await Product.findByIdAndUpdate(
                productId,
                {
                    name: name,
                    imageUrl: urlImage,
                    description: description,
                    price: price,
                    guarantee: guarantee,
                    address: address,
                    madeIn: madeIn,
                    year: year,
                },
                { new: true }
            );

        } else {
            updatedProduct = await Product.findByIdAndUpdate(
                productId,
                {
                    name: name,

                    description: description,
                    price: price,
                    guarantee: guarantee,
                    address: address,
                    madeIn: madeIn,
                    year: year,
                },
                { new: true }
            );
        }
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Add optional fields if they exist
        if (req.files['video']) {
            const video = req.files['video'][0];
            const urlVideo = 'https://net-zoon.onrender.com/' + video.path.replace(/\\/g, '/');
            updatedProduct.vedioUrl = urlVideo;
        }

        if (req.files['gif']) {
            const gif = req.files['gif'][0];
            const gifUrl = 'https://net-zoon.onrender.com/' + gif.path.replace(/\\/g, '/');
            updatedProduct.gifUrl = gifUrl;
        }

        await updatedProduct.save();

        return res.status(200).json('success');
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        // const product = await Product.findById(productId);

        // deleteFile(product.imageUrl);
        const deletedProduct = await Product.findByIdAndRemove(productId);

        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }


        return res.status(200).json('success');
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error });
    }
};





export const getUserProducts = async (req, res) => {
    const { userId } = req.body;
    const ownerId = new mongoose.Types.ObjectId(userId); // Convert userId to ObjectId

    try {
        const products = await Product.find({ owner: ownerId }).populate('category', 'name').populate('owner', 'username');
        return res.status(200).json(products);
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};



