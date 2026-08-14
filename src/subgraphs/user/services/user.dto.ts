// user.dto.ts

import { Role } from "@/core/shared/domain/role";


export interface UserResponse {

 id:string;

 email:string;

 name:string;

 isActive:boolean;

 picture:string;

 role:Role;

 status:string;

 tokenVersion:number;

 createdAt:Date;

 updatedAt:Date;

}