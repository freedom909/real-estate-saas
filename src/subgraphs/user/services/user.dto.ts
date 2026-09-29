// user.dto.ts

import { GlobalRole } from "@/core/shared/domain/role";
import { Profile } from "../domain/entities/profile";


export interface UserResponse {

 id:string;

 email:string;

 name:string;

 isActive:boolean;

 picture:string;

 globalRole:GlobalRole;
 profile:Profile | undefined;

 status:string;

 tokenVersion:number;

 createdAt:Date;

 updatedAt:Date;

}