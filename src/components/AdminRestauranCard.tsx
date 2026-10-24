import axios from "axios";
import { adminServer } from "../main";
import toast from "react-hot-toast";
import { useState } from "react";

const AdminRestaurantCard = ({
    restaurant,
    onVerify,
}: {
    restaurant: any;
    onVerify: () => void;
}) => {
    const [loading, setLoading] = useState(false);

    const verify = async () => {
        try {
            setLoading(true);

            await axios.patch(
                `${adminServer}/api/v1/verify/restaurant/${restaurant._id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            toast.success("Restaurant verified successfully");
            onVerify();
        } catch (error) {
            console.error("Failed to verify restaurant:", error);
            toast.error("Failed to verify restaurant");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-xl bg-white shadow-md overflow-hidden border border-gray-100">
            <img
                src={
                    restaurant.image ||
                    restaurant.imageUrl ||
                    "https://placehold.co/600x300?text=Restaurant"
                }
                alt={restaurant.name || "Restaurant"}
                className="w-full h-48 object-cover"
            />

            <div className="p-4 space-y-3">
                <h2 className="text-lg font-bold text-gray-800">
                    {restaurant.name || "Unnamed Restaurant"}
                </h2>

                <p className="text-sm text-gray-600">
                    {restaurant.address || "Address not available"}
                </p>

                {restaurant.email && (
                    <p className="text-sm text-gray-600">
                        Email: {restaurant.email}
                    </p>
                )}

                {restaurant.phone && (
                    <p className="text-sm text-gray-600">
                        Phone: {restaurant.phone}
                    </p>
                )}

                <button
                    onClick={verify}
                    disabled={loading}
                    className="w-full rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? "Verifying..." : "Verify Restaurant"}
                </button>
            </div>
        </div>
    );
};

export default AdminRestaurantCard;