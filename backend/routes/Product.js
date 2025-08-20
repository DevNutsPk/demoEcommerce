const express=require('express')
const productController=require("../controllers/Product")
const { verifyToken, verifyIsSuperAdmin, hasPermission } = require('../middleware/VerifyToken')
const router=express.Router()

// Public routes (no auth required)
router.get("/",productController.getAll)
router.get("/:id",productController.getById)

// Admin routes (require authentication and appropriate permissions)
router.post("/", verifyToken, hasPermission('create_product'), productController.create)
router.patch("/:id", verifyToken, hasPermission('update_product'), productController.updateById)
router.patch("/undelete/:id", verifyToken, verifyIsSuperAdmin, productController.undeleteById)
router.delete("/:id", verifyToken, verifyIsSuperAdmin, productController.deleteById)

module.exports=router