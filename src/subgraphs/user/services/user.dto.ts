// user.dto.ts

import { Role } from "@/wisdom-web/app/permission/role";


export interface UserResponse {

 id:string;

 email:string;

 name:string;

 picture:string;

 role:Role;

 status:string;

 tokenVersion:number;

 createdAt:Date;

 updatedAt:Date;

}