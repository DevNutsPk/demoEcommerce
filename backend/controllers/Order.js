const Order = require("../models/Order");
const User = require("../models/User");

exports.create=async(req,res)=>{
    try {
        const created=new Order(req.body)
        await created.save()
        res.status(201).json(created)
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Error creating an order, please trying again later'})
    }
}

exports.getByUserId=async(req,res)=>{
    try {
        const {id}=req.params
        const results=await Order.find({user:id})
        res.status(200).json(results)
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Error fetching orders, please trying again later'})
    }
}

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid order ID format" });
        }
        
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        
        res.status(200).json(order);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching order details" });
    }
};

exports.getAll = async (req, res) => {
    try {
        let skip=0
        let limit=0

        if(req.query.page && req.query.limit){
            const pageSize=req.query.limit
            const page=req.query.page
            skip=pageSize*(page-1)
            limit=pageSize
        }

        const totalDocs=await Order.find({}).countDocuments().exec()
        const results=await Order.find({}).skip(skip).limit(limit).exec()

        res.header("X-Total-Count",totalDocs)
        res.status(200).json(results)

    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error fetching orders, please try again later'})
    }
};

exports.updateById=async(req,res)=>{
    try {
        const {id}=req.params
        const updated=await Order.findByIdAndUpdate(id,req.body,{new:true})
        res.status(200).json(updated)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error updating order, please try again later'})
    }
}

exports.updateStatus = async (req, res) => {
    try {
        console.log('Request received:', { params: req.params, body: req.body, user: req.user });
        
        const { id } = req.params;
        const { status } = req.body;
        
        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid order ID format" });
        }
        
        // Validate status
        const validStatuses = ['Pending', 'Dispatched', 'Out for delivery', 'Delivered', 'Cancelled'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ 
                message: "Invalid status value", 
                validStatuses: validStatuses 
            });
        }
        
        // Check if user exists and is admin
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: "Authentication required" });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        
        if (!user.isAdmin) {
            return res.status(403).json({ message: "Forbidden: Admin access required to update order status" });
        }
        
        // Find and update order
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        
        console.log('Order found:', { currentStatus: order.status, statusHistory: order.statusHistory });
        
        // Initialize statusHistory if it doesn't exist
        if (!order.statusHistory) {
            order.statusHistory = [];
        }
        
        // Update status and add to history
        const previousStatus = order.status;
        order.status = status;
        order.statusHistory.push({ 
            status: status, 
            changedAt: new Date(),
            changedBy: userId
        });
        
        console.log('About to save order with:', { newStatus: order.status, statusHistory: order.statusHistory });
        
        const savedOrder = await order.save();
        console.log('Order saved successfully:', savedOrder);
        
        res.status(200).json({
            message: "Order status updated successfully",
            orderId: order._id,
            previousStatus: previousStatus,
            newStatus: status,
            updatedAt: new Date(),
            statusHistory: order.statusHistory
        });
        
    } catch (error) {
        console.log('Error in updateStatus:', error);
        res.status(500).json({ message: "Error updating order status" });
    }
};
