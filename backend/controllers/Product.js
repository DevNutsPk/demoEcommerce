const { Schema, default: mongoose } = require("mongoose")
const Product=require("../models/Product")

exports.create=async(req,res)=>{
    try {
        const created=new Product(req.body)
        await created.save()
        res.status(201).json(created)
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Error adding product, please trying again later'})
    }
}

exports.getAll = async (req, res) => {
    try {
        const filter={}
        const sort={}
        let skip=0
        let limit=0

        if(req.query.brand){
            filter.brand={$in:Array.isArray(req.query.brand)?req.query.brand:req.query.brand.split(',')}
        }

        if(req.query.category){
            const categoryArray = Array.isArray(req.query.category) ? req.query.category : req.query.category.split(',')
            filter.category={$in:categoryArray}
        }

        if(req.query.keyword){
            const keyword = req.query.keyword.trim()
            if(keyword.length>0){
                filter.$or = [
                    { title: { $regex: keyword, $options: 'i' } },
                    { description: { $regex: keyword, $options: 'i' } }
                ]
            }
        }

        if(req.query.minPrice || req.query.maxPrice){
            filter.price = {}
            if(req.query.minPrice){
                filter.price.$gte = parseFloat(req.query.minPrice)
            }
            if(req.query.maxPrice){
                filter.price.$lte = parseFloat(req.query.maxPrice)
            }
        }

        if(req.query.user){
            filter['isDeleted']=false
        }

        if(req.query.sort){
            sort[req.query.sort]=req.query.order?req.query.order==='asc'?1:-1:1
        }

        if(req.query.page && req.query.limit){

            const pageSize=parseInt(req.query.limit)
            const page=parseInt(req.query.page)

            skip=pageSize*(page-1)
            limit=pageSize
        }

        // Admin keyword search across multiple attributes (title, description, brand name, category name, numeric fields)
        // and optional rating filter – uses aggregation so we can match on referenced docs.
        if(!req.query.user && (req.query.keyword || req.query.rating)){
            const keyword = (req.query.keyword || '').trim()
            const isKeywordPresent = keyword.length>0
            const numericValue = parseFloat(keyword)
            const isNumeric = !isNaN(numericValue)

            // base filter without keyword's $or (we will apply keyword match in aggregation)
            const baseMatch = { ...filter }
            if(baseMatch.$or){ delete baseMatch.$or }

            const minRating = parseFloat(req.query.rating)

            const keywordOr = isKeywordPresent ? [
                { title: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } },
                { 'brand.name': { $regex: keyword, $options: 'i' } },
                { 'category.name': { $regex: keyword, $options: 'i' } },
                ...(isNumeric ? [
                    { price: numericValue },
                    { discountPercentage: numericValue },
                    { stockQuantity: numericValue }
                ] : [])
            ] : []

            const pipeline = [
                { $match: baseMatch },
                { $lookup: { from: 'brands', localField: 'brand', foreignField: '_id', as: 'brand' } },
                { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
                { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'category' } },
                { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
                ...(req.query.rating ? [
                    { $lookup: { from: 'reviews', localField: '_id', foreignField: 'product', as: 'reviews' } },
                    { $addFields: { avgRating: { $ifNull: [ { $avg: '$reviews.rating' }, 0 ] } } },
                    { $match: { avgRating: { $gte: minRating } } }
                ] : []),
                ...(isKeywordPresent ? [{ $match: { $or: keywordOr } }] : []),
                { $sort: Object.keys(sort).length ? sort : { createdAt: -1 } },
                { $facet: {
                    results: [
                        { $skip: skip },
                        ...(limit ? [{ $limit: limit }] : [])
                    ],
                    totalCount: [ { $count: 'count' } ]
                } }
            ]

            const aggResult = await Product.aggregate(pipeline)
            const results = aggResult[0]?.results || []
            const totalDocs = aggResult[0]?.totalCount?.[0]?.count || 0

            res.set('X-Total-Count', totalDocs)
            return res.status(200).json(results)
        }

        // Default path without aggregation
        const totalDocs=await Product.find(filter).sort(sort).populate("brand").countDocuments().exec()
        const results=await Product.find(filter).sort(sort).populate("brand").skip(skip).limit(limit).exec()

        res.set("X-Total-Count",totalDocs)

        res.status(200).json(results)
    
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error fetching products, please try again later'})
    }
};

exports.getById=async(req,res)=>{
    try {
        const {id}=req.params
        const result=await Product.findById(id).populate("brand").populate("category")
        res.status(200).json(result)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error getting product details, please try again later'})
    }
}

exports.updateById=async(req,res)=>{
    try {
        const {id}=req.params
        const updated=await Product.findByIdAndUpdate(id,req.body,{new:true})
        res.status(200).json(updated)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error updating product, please try again later'})
    }
}

exports.undeleteById=async(req,res)=>{
    try {
        const {id}=req.params
        const unDeleted=await Product.findByIdAndUpdate(id,{isDeleted:false},{new:true}).populate('brand')
        res.status(200).json(unDeleted)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error restoring product, please try again later'})
    }
}

exports.deleteById=async(req,res)=>{
    try {
        const {id}=req.params
        const deleted=await Product.findByIdAndUpdate(id,{isDeleted:true},{new:true}).populate("brand")
        res.status(200).json(deleted)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error deleting product, please try again later'})
    }
}


