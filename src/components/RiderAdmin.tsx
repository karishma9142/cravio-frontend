import axios from "axios";
import { useState } from "react";
import { adminServer } from "../main";
import toast from "react-hot-toast";

const AdminRiderCard = ({
    rider,
    onVerify,
}: {
    rider: any;
    onVerify: () => void;
}) => {
    const [loading, setLoading] = useState(false);

    const verify = async () => {
        try {
            setLoading(true);

            await axios.patch(
                `${adminServer}/api/v1/verify/rider/${rider._id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            toast.success("Rider verified successfully");
            onVerify();
        } catch (error) {
            console.error("Failed to verify rider:", error);
            toast.error("Failed to verify rider");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md">
            <img
                src={
                    rider.image ||
                    rider.profileImage ||
                    "https://placehold.co/600x300?text=Rider"
                }
                alt={rider.name || "Rider"}
                className="h-48 w-full object-cover"
            />

            <div className="space-y-3 p-4">
                <h2 className="text-lg font-bold text-gray-800">
                    {rider.name || "Unnamed Rider"}
                </h2>

                <p className="text-sm text-gray-600">
                    Email: {rider.email || "Not available"}
                </p>

                <p className="text-sm text-gray-600">
                    Phone: {rider.phone || "Not available"}
                </p>

                <p className="text-sm text-gray-600">
                    Vehicle: {rider.vehicleType || "Not available"}
                </p>

                <button
                    onClick={verify}
                    disabled={loading}
                    className="w-full rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? "Verifying..." : "Verify Rider"}
                </button>
            </div>
        </div>
    );
};

export default AdminRiderCard;