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

    customerId: string;

    tenantId: string;

    checkInDate: Date;
    checkOutDate: Date;

    amount: number;

    status: PaymentStatus;

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
        | "cancelReason"
        | "processedAt"
        | "completedAt"
        | "refundedAt"
        | "createdAt"
        | "updatedAt" // These are handled by timestamps: true and underscored: true
        | "checkInDate"
        | "checkOutDate"
    > { }

export class PaymentModel
    extends Model<
        PaymentAttributes,
        PaymentCreationAttributes
    >
    implements PaymentAttributes {
    public id!: string;

    public bookingId!: string;

    public customerId!: string;

    public tenantId!: string;

    public checkInDate!: Date;
    public checkOutDate!: Date;

    public amount!: number;

    public status!: PaymentStatus;

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
            field: 'booking_id', // Explicitly map to snake_case
        },

        customerId: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'customer_id', // Explicitly map to snake_case
        },

        tenantId: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'tenant_id', // Explicitly map to snake_case
        },

        checkInDate: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'check_in_date',
        },

        checkOutDate: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'check_out_date',
        },

        amount: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
        },

        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW, // Sequelize will map this to 'created_at' due to underscored: true
        },

        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            // Sequelize will map this to 'updated_at' due to underscored: true
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

        cancelReason: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'cancel_reason', // Explicitly map to snake_case
        },

        processedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'processed_at', // Explicitly map to snake_case
        },

        completedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'completed_at', // Explicitly map to snake_case
        },

        refundedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'refunded_at', // Explicitly map to snake_case
        },
    },

    {
        sequelize,

        tableName: "payments",
        timestamps: true,
        underscored: true, // This will automatically map camelCase attributes to snake_case columns
    }
);

export default PaymentModel;