//src/sub

import mongoose, { Types } from "mongoose";

interface ITenant{
_id:Types.ObjectId;
name:string;
plan:string;
status:string;
createdAt:Date;
userId:Types.ObjectId;
updateAt:Date;
}

const tenantSchema=new mongoose.Schema({
    _id:Types.ObjectId,
    name:{type:String,required:true},
    plan:{type:String,required:true},
    status:{type:String,required:true},
    updateAt:{type:Date,default:Date.now},
    createdAt:{type:Date,default:Date.now},

})
tenantSchema.index({ tenantId: 1 },{unique:true})
export default mongoose.model<ITenant>("Tenant",tenantSchema)