// user.dto.ts

import { Role } from "@/core/user/domain/entities/normalize.role";

export interface UserResponse {

 id:string;

 email:string;

 name:string;

 avatar:string;

 role:Role;

 status:string;

 tokenVersion:number;

 createdAt:Date;

 updatedAt:Date;

}