// src/modules/audit/domain/value-objects/audit-log.model.ts

import mongoose, { Schema, Document, model } from "mongoose"
import { AUDIT_STATUS, AuditMeta, AuditStatus, RESOURCE_TYPES, ResourceType } from "./audit.types";


export interface AuditLogDocument
  extends Document {

  userId?: mongoose.Types.ObjectId;

  tenantId?: string;

  ownerId?: string;

  action: string;

  resourceId: string;

  resourceType: ResourceType;

  status: AuditStatus;

  requestId?: string;

  correlationId?: string;

  meta?: AuditMeta;

  createdAt: Date;
}

/* =========================================
   SCHEMA
========================================= */

export const AuditLogSchema =
  new Schema<AuditLogDocument>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        
      },

      tenantId: {
        type: String,
     
      },

      ownerId: {
        type: String,
     
      },

      action: {
        type: String,
        required: true,
      
      },

      resourceId: {
        type: String,
        required: true,
      
      },

      resourceType: {
        type: String,
        enum: RESOURCE_TYPES,
        required: true,
        
      },

      status: {
        type: String,
        enum: AUDIT_STATUS,
        required: true,
      },

      requestId: {
        type: String,
       
      },

      correlationId: {
        type: String,
        
      },

      meta: {
        deviceId: String,
        provider: String,
        ip: String,
        userAgent: String,
        reason: String,
      },

      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
      versionKey: false,
    }
  );

/* =========================================
   INDEXES
========================================= */
AuditLogSchema.index({
  userId: 1,
});

AuditLogSchema.index({
  tenantId: 1,
});

AuditLogSchema.index({
  ownerId: 1,
});

AuditLogSchema.index({
  action: 1,
});

AuditLogSchema.index({
  resourceId: 1,
});

AuditLogSchema.index({
  requestId: 1,
});

AuditLogSchema.index({
  correlationId: 1,
});

AuditLogSchema.index({
  createdAt: -1,
});

/* =========================================
   MODEL
========================================= */
export const AuditLogModel = model<AuditLogDocument>(
  "AuditLog",
  AuditLogSchema
);