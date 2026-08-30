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
    _id : string
    restaurantId: string;
    description: string;
    name: string;
    image: string;
    price: number;
    isAvailables: boolean;
    createdAt: Date;
    UpdatedAt: Date;
}
