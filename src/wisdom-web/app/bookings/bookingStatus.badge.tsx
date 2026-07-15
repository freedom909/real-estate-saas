// 预订状态标签
"use client";

export function BookingStatusBadge({ status }: { status: string }) {

    const colors: Record<string, string> = {

        PENDING: "bg-yellow-100 text-yellow-700",

        CONFIRMED: "bg-green-100 text-green-700",

        CANCELLED: "bg-red-100 text-red-700",

    };

    return (

        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${colors[status]}`}>

            { status }

</span >

);

}

type Props={
    status:"PENDING"|"CONFIRMED"|"CANCELLED"|"SUCCEEDED"|"FAILED"|"REFUNDED";
}

export default function PaymentStatusBadge({ status }: Props) {
    const styles={
        PENDING:"bg-yellow-100 text-yellow-700",
        CONFIRMED:"bg-green-100 text-green-700",
        CANCELLED:"bg-red-100 text-red-700",
        SUCCEEDED:"bg-green-100 text-green-700",
        FAILED:"bg-red-100 text-red-700",
        REFUNDED:"bg-green-100 text-green-700",
    }
    return <BookingStatusBadge status={status} />
}