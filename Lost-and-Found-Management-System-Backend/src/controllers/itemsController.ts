import { Request,Response } from "express"
import { createItemSchema } from "../Schemas/authSchema";
import Item from "../models/Item";
interface AuthRequest extends Request{
  user?:{id:string;email:string; role:'user'|'admin'}
}

export const createItem = async(req:AuthRequest,res:Response)=>{
  try {
    const validatedDate = createItemSchema.parse(req.body);

   const item = new Item({
      ...validatedDate,
      postedBy: req.user!.id,
      itemStatus: 'open'
    });
    await item.save();

    const populateItem = await Item.findById(item._id).populate('postedBy','name email').lean();

    res.status(201).json({
      success: true,
      data: populateItem
    });
  } catch (error:any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid item data', details: error.errors }
      });
    }
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to create item' }
    });
  }
}

export const getItem = async (req:AuthRequest,res:Response)=>{
   try {
    const {
  page=1,
  limit=10,
  status,
  category,
  itemStatus,
  search,
  sort='newest'
}=req.query as any;

const pageNum = parseInt(page as string);
const limitNum = Math.min(parseInt(limit as string),50);
const skip = (pageNum-1)*limitNum;

const filter:any = {itemStatus:{$ne:'resolved'}};

if(status) filter.status = status;
if(category) filter.category = category;
if(itemStatus) filter.itemStatus = itemStatus;
if(search){
  filter.$or = [
    {title:{$regex:search, $options:'i'}},
    {description:{$regex:search,$options:'i'}}
  ];
};

const itemsPipline:any[] = [
  {$match:filter},
  {$sort:sort === 'newest'? {createdAt:-1}:{updatedAt:-1}},
  {$skip:skip},
  {$limit:limitNum},
  {
    $lookup:{
      from:'users',
      localField:'postedBy',
      foreignField:'_id',
      as:'postedBy',
      pipeline:[{$project:{name:1,email:1}}]
    }
  },
  {$unwind:{path:"$postedVy",preserveNullAndEmptyArrays:true}},
  {
    $project:{
      title:1,
      description:1,
      category:1,
      status:1,
      itemStatus:1,
      images:1,
      postedBy:{name:1,email:1},
      createdAt:1,
      updatedAt:1,
      expiryDate:1
    }
  }
];

const [items,total] = await Promise.all([
  Item.aggregate(itemsPipline),
  Item.countDocuments(filter)
])

res.json({
  success:true,
  data:{
    items,
    pagination:{
      page:pageNum,
      limit:limitNum,
      total,
      pages:Math.ceil(total/limitNum),
      hasNext:pageNum*limitNum<total
    }
  }
})

  } catch (error) {
    console.error('Get items error:', error)
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch items' }
    });
  }
}

export const getItemById = async (req:AuthRequest,res:Response)=>{
  try {
    const item = await Item.findById(req.params.id).populate('postedBy','name email').populate('claimedBy','name email').lean();

    if(!item){
      return res.status(404).json({
        success:false,
        error:{code:'NOT_FOUND',message:"Item not found"}
      })
    }

    res.json({
      success:true,
      data:item
    })
  } catch (error) {
  res.status(500).json({
    success:false,
    error:{code:"SERVER_ERROR",message:"Failed to fectch item"}
  })  
  }
}

export const updateitem = async (req:AuthRequest,res:Response )=>{
  try {
    const item = await Item.findOne({
      _id:req.params.id,
      $or:[
        {postedBy:req.user!.id},
        {'postedBy':req.user!.id}
      ]
    });
    if(!item){
      return res.status(403).json({
        success:false,
        error:{code:'FORBIDDEN',message:"You can only update your own items"}
      });
    }

    const updates = req.body;
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      {...updates,updatedAt:new Date()},
      {new:true , runValidators:true}
    ).populate('postedBy','name email');

    res.json({
      success:true,
      data:updatedItem
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: { code: 'UPDATE_ERROR', message: 'Failed to update item' }
    });
  }
}


export const deleteItem = async (req:AuthRequest,res:Response)=>{
  try {
    const item = await Item.findOne({
      _id:req.params.id,
      postedBy:req.user!.id,
      itemStatus:'open'
    });

    if(!item){
      return res.status(403).json({
        success:false,
        error:{
          code:"FORBIDDEN",
          message:"Can only delete your own open items"
        }
      })
    }

    await Item.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'DELETE_ERROR', message: 'Failed to delete item' }
    });
  }
}