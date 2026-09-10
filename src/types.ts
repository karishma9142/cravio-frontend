export interface User{
    _id: string,
    name: string,
    email: string,
    image: string,
    role: string
}

export interface locationData {
    latitude : number,
    longitude : number,
    formattedAddress : string
}

export interface AppContextType {
    user : User | null,
    loading : boolean,
    isAuth : boolean,
    location : locationData | null,
    loadingLocation : boolean,
    city : string 
    setUser : React.Dispatch<React.SetStateAction<User | null>>;
    setIsAuth : React.Dispatch<React.SetStateAction<boolean>>;
    setLoading : React.Dispatch<React.SetStateAction<boolean>>;
    cart : ICart[] | null;
    fetchCart : ()=> Promise<void>;
    subtotal : number;
    quantity : number;
    loadingCart: boolean;
}

export interface IRestaurant  {
    _id : string,
    name: string,
    description?: string,
    image: string,
    ownerId: string,
    phone: number,
    isVerified: boolean,

    autoLocation: {
        type: "Point",
        coordinates: [number, number]; // [longitude , latitdue]
        formattedAddress: string
    },
    isOpen: boolean,
    createdAt: Date
};

export interface IMenuItem {
    _id : string;
    restaurantId: string;
    description: string;
    name: string;
    image: string;
    price: number;
    isAvailables: boolean;
    createdAt: Date;
    UpdatedAt: Date;
}

export interface ICart {
    _id : string
    userid : string;
    restaurantId: string | IRestaurant;
    itemId : string | IMenuItem;
    quantity : number;
    createdAt : Date;
    updatedAt : Date;
}

export interface IOrder {
    _id : string;
    userId: string;
    restaurantId: string;
    restaurantName: string;
    riderId: string | null;
    riderPhone: number | null;
    riderName: string | null;
    distance: number;
    riderAmount: number;

    items: {
        itemId: string
        name: string;
        price: number;
        quantity: number
    }[];

    subtotal: number;
    deliveryFee: number;
    platfromFee: number;
    totalAmount: number;

    addressId: string;

    deliveryAddress: {
        formattedAddress: string;
        mobile: number;
        latitude: number;
        longitude: number;
    };

    status: | 'placed' | 'accepted' | 'preaparing' | 'ready_for_rider' | 'rider_assigned' | 'picked_up' | 'delivered' | 'cancelled';

    paymentMethod: 'razorpay' | 'stripe';
    paymentStatus: 'pending' | 'paid' | 'failed';
    expireAt: Date;

    createdAt: Date;
    updatedAt: Date;
}
