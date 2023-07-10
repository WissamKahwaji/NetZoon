import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;

import { Category } from "../models/categories/categoryModel.js";
import { Customs } from "../models/categories/customs/customs.js";
import { CompanyCategory } from "../models/categories/freezoon/company_category.js";
import { Freezoon } from "../models/categories/freezoon/freezoon.js";
import { GovernmentalCompany } from "../models/categories/governmental/governmental_company.js";
import { LocalCompany } from "../models/categories/local_company/local_company.js";
import { FactoryCategories } from '../models/categories/factory/factories_categories.js';
import { Factory } from "../models/categories/factory/factory.js";
// import { Product } from "../models/product/product.js";
import { Vehicle } from "../models/categories/vehicle/vehicleModel.js";
import { GovernmentalCategory } from "../models/categories/governmental/govermental_categories_model.js";
import { validationResult } from 'express-validator';
import userModel from '../models/userModel.js';
import { Governmental } from '../models/categories/governmental/gonermental_model.js';
import { customscategories } from '../models/categories/customs/custom_categories.js';
import { VehicleCompany } from '../models/categories/vehicle/vehicle_company_model.js';


//Categories controllers
export const getAllCategories = async (req, res) => {
    try {
        const data = await Category.find({});
        if (data) {
            return res.status(200).json({
                message: "success",
                results: data,
            });
        }
    } catch (error) {
        return res.status(500).json({ message: "Something went wrong" });

    }

};


export const createCategory = async (req, res) => {
    try {

        const { url, name } = req.body;

        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.json(error);
        }
        const exisitingCategory = await Category.findOne({ name });

        if (exisitingCategory) {
            return res.json({
                msg: "Category already exists"
            });
        }


        const newCategory = await Category.create({ url: url, name: name, });
        res.status(200).json({
            success: true,
            msg: "Category created successfully",
            results: newCategory,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//FreeZoon controllers
export const getFreezoon = async (req, res) => {
    try {

        const data = await Freezoon.find().select('-freezoonplaces');
        if (!data) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json({
            message: "success",
            results: data,
        });

    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};
export const getFreezoonById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Freezoon.findById(id).populate('freezoonplaces');
        if (!data) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json({
            message: "success",
            results: data,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const createfreezoon = async (req, res) => {
    try {

        const companyCategory = new CompanyCategory({
            categoryName: 'dubai',
            name: 'dubasai',
            city: 'dubasai',
            address: 'dubai',
            email: 'dubai@gmail.com',
            imgurl: 'asd',
            info: 'as',
            companyimages: ['asd'],
            videourl: 'asd',
        });
        const companyCategory2 = new CompanyCategory({
            categoryName: 'dubai2',
            name: 'dubasai',
            city: 'dubasai',
            address: 'dubai',
            email: 'dubai@gmail.com',
            imgurl: 'asd',
            info: 'as',
            companyimages: ['asd'],
            videourl: 'asd',
        });


        await companyCategory.save();
        await companyCategory2.save();

        const freezoon = new Freezoon({
            name: 'freezoon',
            img: 'asdd',
            freezoonplaces: [companyCategory._id, companyCategory2._id],
        });

        await freezoon.save();

        return res.json({
            msg: "success",
        })
    } catch (error) {
        res.status(500).json({ message: error.message });

    }
};

//Customs controllers
export const getCustomsCategory = async (req, res) => {

    try {
        const data = await Customs.find().select('-customsplaces');
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });

    }

}

export const getCustoms = async (req, res) => {
    try {

        const data = await Customs.find({}).populate('customsplaces');
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getCustomsById = async (req, res) => {
    try {
        const { id } = req.params;
        const custom = await Customs.findById(id).populate('customsplaces');
        if (!custom) {
            return res.status(404).json({ message: 'no Data Found' });
        }
        res.json(custom);

    } catch (error) {

        res.status(500).json({ message: error.message });
    }
};



//localcompany controllers
export const getAllLocalCompanies = async (req, res) => {

    try {
        const data = await LocalCompany.find({}).select('-products');
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });

    }

}

export const getLocalCompanyById = async (req, res) => {
    try {
        const { id } = req.params;
        const company = await LocalCompany.findById(id);
        if (!company) {
            return res.status(404).json({ message: 'no Data Found' });
        }
        res.json(company);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


export const getLocalCompanyProducts = async (req, res) => {

    try {
        const { id } = req.params;
        const company = await LocalCompany.findById(id).populate('products').populate({
            path: 'products',
            populate: {
                path: 'category',
                select: 'name',
            },
        });
        if (!company) {
            return res.status(404).json({ message: 'no Data Found' });
        }
        const products = company.toObject().products;

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//Govermental Company controllers
export const getGovermental = async (req, res) => {
    try {

        const data = await Governmental.find().select('-govermentalCompanies');
        if (!data) {
            return res.status(404).json({ message: 'Governmental not found' });
        }
        res.status(200).json(data);

    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const getGovermentalById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Governmental.findById(id).populate('govermentalCompanies');
        if (!data) {
            return res.status(404).json({ message: 'Governmental not found' });
        }
        res.status(200).json(data);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
}

//Factory controllers
export const getAllFactoriesCategories = async (req, res) => {
    try {
        await Factory.find({});
        const data = await FactoryCategories.find({}, { title: 1, });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}



export const getAllFactories = async (req, res) => {
    try {
        const { id } = req.params;

        const data = await FactoryCategories.findById(id, { factory: 1, _id: 0 }).populate('factory');
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getFactoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const factory = await Factory.findById(id);
        if (!factory) {
            return res.status(404).json({ message: 'Factory not found' });
        }
        res.json(factory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
//cars companies

export const getCarsCompanies = async (req, res) => {

    try {
        // const carsCompanies = await VehicleCompany.find({ type: 'cars' });
        const carsCompanies = await userModel.find({ userType: 'car' });

        res.status(200).json(carsCompanies);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

export const getCompaniesVehicles = async (req, res) => {
    try {
        const { type, id } = req.body;
        // const carsCompanies = await VehicleCompany.findOne({ type: type, _id: id }).populate('vehicles');
        // const vehicles = carsCompanies.vehicles;
        // res.status(200).json(vehicles);
        const carsCompanies = await Vehicle.find({ creator: id }).populate('creator', 'username');
        res.status(200).json(carsCompanies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
//planes companies

export const getPlanesCompanies = async (req, res) => {

    try {
        // const planesCompanies = await VehicleCompany.find({ type: 'planes' });
        const planesCompanies = await userModel.find({ userType: 'plans' });

        res.status(200).json(planesCompanies);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

//Cars Controllers
export const getAllCars = async (req, res) => {
    try {
        const cars = await Vehicle.find({ category: "cars" }).populate('creator', 'username');
        res.json({
            message: "success",
            results: cars,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

export const getLatestCarsByCreator = async (req, res) => {
    try {
        const latestCars = await Vehicle.aggregate([
            {
                $match: { category: "cars" }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: "$creator",
                    latestCar: { $first: "$$ROOT" }
                }
            },
            {
                $replaceRoot: {
                    newRoot: "$latestCar"
                }
            }
        ]);

        // Get creator information for each car
        const populatedLatestCars = await Promise.all(
            latestCars.map(async (car) => {
                const populatedCar = car;
                populatedCar.creator = await userModel.findById(car.creator, "username");
                return populatedCar;
            })
        );

        res.json({
            message: "success",
            results: populatedLatestCars
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




//Plans Controllers
export const getAllPlans = async (req, res) => {
    try {
        const plans = await Vehicle.find({ category: "plans" }).populate('creator', 'username');
        res.json({
            message: "success",
            results: plans,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getAllUsedPlans = async (req, res) => {
    try {
        const plans = await Vehicle.find({ category: "plans", type: "old" }).populate('creator', 'username');
        res.json({
            message: "success",
            results: plans,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllNewPlans = async (req, res) => {
    try {
        const plans = await Vehicle.find({ category: "plans", type: "new" }).populate('creator', 'username');
        res.json({
            message: "success",
            results: plans,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getVehicleById = async (req, res) => {
    try {
        const { id } = req.params;
        const vehicle = await Vehicle.findById(id).populate('creator', 'username');
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        res.json({
            message: "success",
            results: vehicle,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createVehicle = async (req, res) => {
    const { creator, name, description, price, kilometers, year, location, type, category } = req.body;
    const image = req.files['image'][0];
    if (!image) {
        return res.status(404).json({ message: 'Attached file is not an image.' });
    }
    const urlImage = 'https://net-zoon.onrender.com/' + image.path.replace(/\\/g, '/');

    try {
        const newVehicle = new Vehicle({
            name,
            imageUrl: urlImage,
            description,
            price,
            kilometers,
            year,
            location,
            type,
            category,
            creator: creator,

        });

        if (req.files['carimages']) {
            const carImages = req.files['carimages'];
            const imageUrls = [];
            if (!carImages || !Array.isArray(carImages)) {
                return res.status(404).json({ message: 'Attached files are missing or invalid.' });
            }

            for (const image of carImages) {
                if (!image) {
                    return res.status(404).json({ message: 'Attached file is not an image.' });
                }

                const imageUrl = 'https://net-zoon.onrender.com/' + image.path.replace(/\\/g, '/');
                imageUrls.push(imageUrl);
                newVehicle.carImages = imageUrls;
            }
        }

        if (req.files['video']) {
            const video = req.files['video'][0];
            const urlVideo = 'https://net-zoon.onrender.com/' + video.path.replace(/\\/g, '/');
            newVehicle.vedioUrl = urlVideo;
        }



        const savedVehicle = await newVehicle.save();

        // Update the user's vehicles array if the user exists
        // if (ObjectId.isValid(creator)) {
        //     const user = await userModel.findById(req.userId);
        //     if (user) {
        //         user.vehicles.push(savedVehicle);
        //         await user.save();
        //     }
        // }

        res.status(201).json("the Vehicle has been added successfuly");
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};