const express=require('express')
const orderController=require("../controllers/Order")
const { verifyToken } = require("../middleware/VerifyToken")
const router=express.Router()


router
    .post("/",orderController.create)
    .get("/",orderController.getAll)
    .get("/user/:id",orderController.getByUserId)
    .put("/:id/status", verifyToken, orderController.updateStatus)
    .get("/:id", orderController.getById)
    .patch("/:id",orderController.updateById)


module.exports=router