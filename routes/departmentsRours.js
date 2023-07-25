import express from 'express';
import { addProduct, deleteProduct, editProduct, filterOnProducts, getAllProducts, getCategoriesByDepartment, getProductById, getProductsByCategory, getUserProducts } from '../controllers/departmenst/departmentsCtrl.js';

const router = express.Router();


router.get('/categories', getCategoriesByDepartment);
router.get('/products', getProductsByCategory);
router.post('/addProduct', addProduct);
router.put('/editProduct/:productId', editProduct);
router.delete('/delete-product/:productId', deleteProduct);
router.get('/allProducts', getAllProducts);
router.get('/getUserProducts/:userId', getUserProducts);
router.get('/filters',filterOnProducts);
router.get('/getproduct/:productId',getProductById);

export default router;