// user.dto.ts

import { Role } from "@/core/shared/domain/role";
import { Profile } from "../domain/entities/profile";


export interface UserResponse {

 id:string;

 email:string;

 name:string;

 isActive:boolean;

 picture:string;

 role:Role;
 profile:Profile | undefined;

 status:string;

 tokenVersion:number;

 createdAt:Date;

 updatedAt:Date;

}