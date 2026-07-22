type Props = { status: "PENDING" | "PAID" | "FAILED" | "REFUNDED"};

export default function PaymentStatusBadge({ status }: Props) {


const styles = {

PENDING: "bg-yellow-100 text-yellow-700",

PAID: "bg-green-100 text-green-700",

FAILED: "bg-red-100 text-red-700",

REFUNDED: "bg-gray-100 text-gray-700",

};


    return (
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${styles[status]}`}>
            {status}
        </span>
    );
}