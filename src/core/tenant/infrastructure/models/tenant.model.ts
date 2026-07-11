import mongoose, { Schema, Document } from "mongoose";
import { TenantDocument } from "../../domain/tenant.model";

export enum TenantStatus {

    ACTIVE = "ACTIVE",

    SUSPENDED = "SUSPENDED",

    DELETED = "DELETED"

}


const TenantSchema = new Schema<TenantDocument>(

    {

        name: {

            type: String,

            required: true,

            trim: true

        },

        slug: {

            type: String,

            required: true,

            unique: true,

            lowercase: true,

            trim: true

        },

        ownerUserId: {

            type: String,

            required: true,

            index: true

        },

        status: {

            type: String,

            enum: Object.values(TenantStatus),

            default: TenantStatus.ACTIVE

        }

    },

    {

        timestamps: true

    }

);

export const TenantModel = mongoose.model<TenantDocument>(

    "Tenant",

    TenantSchema

);

export default TenantModel;

export const TenantModelToken = Symbol.for("TenantModel");