import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { riderServer } from "../main";
import toast from "react-hot-toast";

interface IRider {
    _id: string,
    pictuer: string,
    phoneNumber: string,
    aadharNumber: string,
    drivingLicenseNumber: string,
    isVerified: boolean,
    isAvailble: boolean,
    lastActive: Date,
}

const RiderDashBoard = () => {
    const { user } = useAppData();
    const { socket } = useSocket();

    const [profile, setProfile] = useState<IRider | null>(null);
    const [loading, setLoading] = useState(false);

    const [toggling, setToggling] = useState(false);
    const fetchProfile = async () => {
        try {
            const { data } = await axios.get(`${riderServer}/api/rider/mtprofile`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setProfile(data || null);
        } catch (error) {
            setProfile(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (user?.role === 'rider') {
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, [user]);

    const toggleAvailibity = async () => {
        if (!navigator.geolocation) {
            toast.error('Location access required');
            return;
        }
        setToggling(true);
        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                await axios.patch(`${riderServer}/api/toggle`, {
                    isAvailble: !profile?.isAvailble,
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                }, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }

                });
                toast.success(profile?.isAvailble ? "You are offline" : "You are online")
            } catch (error: any) {
                toast.error(error.response.data.message)
            } finally {
                setToggling(false);
            }
        })
    };
    if (user?.role !== 'rider') {
        return <div className="flex min-h-[60vh] items-center text-gray-500">
            You are not registered as rider
        </div>
    }
    if (loading) {
        return
        <div className="flex min-h-[60vh] items-center text-gray-500">
            Loading rider details ...
        </div>
    }
    // if (!profile) return (
    //     <div className="min-h-screen bg-gray-50 px-4 py-6">
    //         <div className="mx-auto max-w-lg  rounded-xl bg-white p-6 shadow-sm space-y-5">
    //             <h1 className="text-xl font-semibold">Add Your Restaurant</h1>
    //             <input
    //                 type="text"
    //                 placeholder="Restaurant name"
    //                 value={name}
    //                 onChange={(e) => setName(e.target.value)}
    //                 className="w-full rounded-lg px-4 py-2 text-sm outline-none border"
    //             />
    //             <input
    //                 type="number"
    //                 placeholder="Contact Number"
    //                 value={phone}
    //                 onChange={(e) => setPhone(e.target.value)}
    //                 className="w-full rounded-lg px-4 py-2 text-sm outline-none border "
    //             />
    //             <textarea
    //                 placeholder="Restaurant Description"
    //                 value={description}
    //                 onChange={(e) => setDesription(e.target.value)}
    //                 className="w-full rounded-lg px-4 py-2 text-sm outline-none border"
    //             />
    //             <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-sm text-gray-600 hover:bg-gray-50">
    //                 <BiUpload className="h-5 w-5 text-red-500" />
    //                 {image ? image.name : "Upload restaurant image"}
    //                 <input
    //                     type="file"
    //                     accept="image/*"
    //                     hidden
    //                     onChange={(e) => setImage(e.target.files?.[0] || null)}
    //                 />
    //             </label>

    //             <div className="flex items-start gap-3 rounded-lg border p-4">
    //                 <BiMapPin className="mt-0.5 h-5 w-5 text-red-500" />
    //                 <div className="text-sm">
    //                     {loadingLocation
    //                         ? "fetching your location..."
    //                         : location?.formattedAddress || 'Location not avliable'
    //                     }
    //                 </div>
    //             </div>
    //             <button className="w-full rounded-lg py-3 text-sm font-semibold text-white bg-[#E23744]"
    //                 disabled={submitting} onClick={hanldleSubmit}>
    //                 {submitting ? "Submitting... " : "Add Restaurant"}
    //             </button>
    //         </div>
    //     </div>
    // )
    return (
        <div>
            RiderDashBoard
        </div>
    )
}

export default RiderDashBoard;