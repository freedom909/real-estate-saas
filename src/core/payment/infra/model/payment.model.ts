//

// src/core/payment/infrastructure/models/payment.model.ts

import {
    DataTypes,
    Model,
    Optional
} from "sequelize";



import { PaymentStatus }   from "../../domain/value-object/paymentt.status";
import { sequelize } from "@/infrastructure/config/seq";

export interface PaymentAttributes {

    id: string;

    bookingId: string;

    guestId: string;

    tenantId: string;

    amount: number;

    status: PaymentStatus;

    paymentIntentId?: string | null;

    refundAmount?: number | null;

    cancelReason?: string | null;

    processedAt?: Date | null;

    completedAt?: Date | null;

    refundedAt?: Date | null;

    createdAt: Date;

    updatedAt: Date;
}

export interface PaymentCreationAttributes
    extends Optional<
        PaymentAttributes,
        | "paymentIntentId"
        | "refundAmount"
        | "cancelReason"
        | "processedAt"
        | "completedAt"
        | "refundedAt"
        | "createdAt"
        | "updatedAt"
    > { }

export class PaymentModel
    extends Model<
        PaymentAttributes,
        PaymentCreationAttributes
    >
    implements PaymentAttributes {
    public id!: string;

    public bookingId!: string;

    public guestId!: string;

    public tenantId!: string;

    public amount!: number;

    public status!: PaymentStatus;

    public paymentIntentId!: string | null;

    public refundAmount!: number | null;

    public cancelReason!: string | null;

    public processedAt!: Date | null;

    public completedAt!: Date | null;

    public refundedAt!: Date | null;

    public readonly createdAt!: Date;

    public readonly updatedAt!: Date;
}

PaymentModel.init(
    {

        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
        },

        bookingId: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        guestId: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        tenantId: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        amount: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
        },

        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },

        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM(
                "PENDING",
                "PROCESSING",
                "SUCCEEDED",
                "FAILED",
                "REFUNDED",
                "CANCELLED"
            ),
            allowNull: false,
            defaultValue: "PENDING",
        },

        paymentIntentId: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        refundAmount: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },

        cancelReason: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        processedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        completedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        refundedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },

    {
        sequelize,

        tableName: "payments",

        timestamps: true,
    }
);

export default PaymentModel;