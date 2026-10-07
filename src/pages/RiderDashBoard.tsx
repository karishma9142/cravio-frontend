import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { riderServer } from "../main";
import toast from "react-hot-toast";
import { BiUpload } from "react-icons/bi";

interface IRider {
    _id: string;
    pictuer: string;
    phoneNumber: string;
    aadharNumber: string;
    drivingLicenseNumber: string;
    isVerified: boolean;
    isAvailble: boolean;
    lastActive: Date;
}

const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const RiderDashBoard = () => {
    const { user } = useAppData();
    const { socket } = useSocket(); // kept for later real-time features

    const [profile, setProfile] = useState<IRider | null>(null);
    const [loading, setLoading] = useState(true); // start true so the form doesn't flash
    const [toggling, setToggling] = useState(false);

    const [phoneNumber, setPhoneNumber] = useState("");
    const [aadharNumber, setAadharNumber] = useState("");
    const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchProfile = async () => {
        try {
            // NOTE: check this route against your backend ("myprofile"?)
            const { data } = await axios.get(`${riderServer}/api/rider/myprofile`, {
                headers: authHeader(),
                timeout: 10000, // stop waiting after 10s so "Loading" can't hang forever
            });
            setProfile(data || null);
        } catch (error) {
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === "rider") {
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, [user]);

    const getLocationErrorMessage = (err: GeolocationPositionError) => {
        if (err.code === err.PERMISSION_DENIED) {
            return "Location permission denied. Please allow location access.";
        }
        if (err.code === err.TIMEOUT) {
            return "Getting your location timed out. Please try again.";
        }
        return "Unable to get your location.";
    };

    const toggleAvailibity = () => {
        if (!navigator.geolocation) {
            toast.error("Location access required");
            return;
        }

        setToggling(true);

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    await axios.patch(
                        `${riderServer}/api/rider/toggle`,
                        {
                            isAvailble: !profile?.isAvailble,
                            latitude: pos.coords.latitude,
                            longitude: pos.coords.longitude,
                        },
                        {
                            headers: authHeader(),
                        }
                    );

                    toast.success(
                        profile?.isAvailble
                            ? "You are offline"
                            : "You are online"
                    );

                    fetchProfile();
                } catch (error: any) {
                    toast.error(
                        error.response?.data?.msg || "Something went wrong"
                    );
                } finally {
                    setToggling(false);
                }
            },
            (err) => {
                toast.error(getLocationErrorMessage(err));
                setToggling(false);
            },
            { timeout: 10000 }
        );
    };

    const handleSubmit = () => {
        if (!phoneNumber || !aadharNumber || !drivingLicenseNumber) {
            toast.error("Please fill in all fields");
            return;
        }
        if (!image) {
            toast.error("Please upload your image");
            return;
        }
        if (!navigator.geolocation) {
            toast.error("Location access required");
            return;
        }
        setSubmitting(true);

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const formData = new FormData();
                formData.append("phoneNumber", phoneNumber); // fixed typo ("phoneNumbe")
                formData.append("aadharNumber", aadharNumber);
                formData.append("drivingLicenseNumber", drivingLicenseNumber);
                formData.append("latitude", pos.coords.latitude.toString());
                formData.append("longitude", pos.coords.longitude.toString());
                formData.append("file", image);

                try {
                    const { data } = await axios.post(`${riderServer}/api/rider/new`, formData, {
                        headers: authHeader(),
                    });
                    toast.success(data.msg || data.message || "Profile added");
                    fetchProfile(); // show the dashboard after success
                } catch (error: any) {
                    toast.error(error.response?.data?.message || "Something went wrong");
                } finally {
                    setSubmitting(false);
                }
            },
            (err) => {
                toast.error(getLocationErrorMessage(err));
                setSubmitting(false);
            },
            { timeout: 10000 }
        );
    };

    if (user?.role !== "rider") {
        return (
            <div className="flex min-h-[60vh] items-center text-gray-500">
                You are not registered as rider
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center text-gray-500">
                Loading rider details ...
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-50 px-4 py-6">
                <div className="mx-auto max-w-lg space-y-5 rounded-xl bg-white p-6 shadow-sm">
                    <h1 className="text-xl font-semibold">Add Your Profile</h1>

                    <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Aadhar number"
                        value={aadharNumber}
                        onChange={(e) => setAadharNumber(e.target.value)}
                        className="w-full rounded-lg border px-4 py-2 text-sm outline-none"
                    />
                    <input
                        type="tel"
                        placeholder="Contact Number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full rounded-lg border px-4 py-2 text-sm outline-none"
                    />
                    <input
                        type="text"
                        placeholder="Driving Licence"
                        value={drivingLicenseNumber}
                        onChange={(e) => setDrivingLicenseNumber(e.target.value)}
                        className="w-full rounded-lg border px-4 py-2 text-sm outline-none"
                    />

                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-sm text-gray-600 hover:bg-gray-50">
                        <BiUpload className="h-5 w-5 text-red-500" />
                        {image ? image.name : "Upload your image"}
                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => setImage(e.target.files?.[0] || null)}
                        />
                    </label>

                    <button
                        className="w-full rounded-lg bg-[#E23744] py-3 text-sm font-semibold text-white disabled:opacity-60"
                        disabled={submitting}
                        onClick={handleSubmit}
                    >
                        {submitting ? "Submitting..." : "Add Profile"}
                    </button>
                </div>
            </div>
        );
    }

    return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-lg overflow-hidden rounded-2xl bg-white shadow-md">

            {/* Header */}
            <div className="bg-[#E23744] px-6 py-8 text-center text-white">
                <div className="mx-auto mb-4 h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-lg">
                    <img
                        src={profile.pictuer}
                        alt="Rider"
                        className="h-full w-full object-cover"
                    />
                </div>

                <h1 className="text-2xl font-bold">
                    Rider Dashboard
                </h1>

                <p className="mt-1 text-sm text-white/80">
                    Manage your delivery status
                </p>
            </div>

            {/* Profile Information */}
            <div className="space-y-5 p-6">

                {/* Status */}
                <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                    <div>
                        <p className="text-xs text-gray-500">
                            Account Status
                        </p>

                        <p className="mt-1 font-semibold text-gray-800">
                            {profile.isVerified
                                ? "Verified Rider"
                                : "Verification Pending"}
                        </p>
                    </div>

                    <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            profile.isVerified
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                        {profile.isVerified ? "Verified" : "Pending"}
                    </span>
                </div>

                {/* Phone */}
                <div className="rounded-xl border border-gray-100 p-4">
                    <p className="text-xs text-gray-500">
                        Phone Number
                    </p>

                    <p className="mt-1 font-medium text-gray-800">
                        {profile.phoneNumber}
                    </p>
                </div>

                {/* Availability */}
                <div className="flex items-center justify-between rounded-xl border border-gray-100 p-4">
                    <div>
                        <p className="text-xs text-gray-500">
                            Delivery Status
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                            <span
                                className={`h-2.5 w-2.5 rounded-full ${
                                    profile.isAvailble
                                        ? "bg-green-500"
                                        : "bg-gray-400"
                                }`}
                            />

                            <p className="font-semibold text-gray-800">
                                {profile.isAvailble
                                    ? "Online"
                                    : "Offline"}
                            </p>
                        </div>
                    </div>

                    <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            profile.isAvailble
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                        }`}
                    >
                        {profile.isAvailble ? "Active" : "Inactive"}
                    </span>
                </div>

                {/* Toggle Button */}
                <button
                    className={`w-full rounded-xl py-3.5 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        profile.isAvailble
                            ? "bg-gray-700 hover:bg-gray-800"
                            : "bg-[#E23744] hover:bg-red-600"
                    }`}
                    disabled={toggling || !profile.isVerified}
                    onClick={toggleAvailibity}
                >
                    {toggling
                        ? "Updating..."
                        : !profile.isVerified
                        ? "Waiting for Verification"
                        : profile.isAvailble
                        ? "Go Offline"
                        : "Go Online"}
                </button>

                {!profile.isVerified && (
                    <p className="text-center text-xs text-gray-500">
                        Your profile must be verified before you can go online.
                    </p>
                )}
            </div>
        </div>
    </div>
);
};

export default RiderDashBoard;