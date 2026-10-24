
import type { IOrder } from "../types";
import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
} from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";

declare module "leaflet" {
    namespace Routing {
        function control(options: any): any;
        function osrmv1(options?: any): any;
    }
}

interface Props {
    order: IOrder;
    socket: Socket | null;
    id: string | undefined;
}

const riderIcon = new L.DivIcon({
    html: "🚗",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    className: "",
});

const deliveryIcon = new L.DivIcon({
    html: "🎁",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    className: "",
});

// Draw a route between the rider and delivery address
const Routing = ({
    from,
    to,
}: {
    from: [number, number];
    to: [number, number];
}) => {
    const map = useMap();

    const [fromLat, fromLng] = from;
    const [toLat, toLng] = to;

    useEffect(() => {
        const routing = L.Routing.control({
            waypoints: [
                L.latLng(fromLat, fromLng),
                L.latLng(toLat, toLng),
            ],
            lineOptions: {
                styles: [{ color: "#E23744", weight: 5 }],
            },
            addWaypoints: false,
            draggableWaypoints: false,
            show: false,
            createMarker: () => null,
            router: L.Routing.osrmv1({
                serviceUrl: "https://router.project-osrm.org/route/v1",
            }),
        }).addTo(map);

        return () => {
            map.removeControl(routing);
        };
    }, [map, fromLat, fromLng, toLat, toLng]);

    return null;
};

const CustomerOrderMap = ({ order, socket, id }: Props) => {
    const [riderLocation, setRiderLocation] =
        useState<[number, number] | null>(null);

    const latitude = order.deliveryAddress.latitude;
    const longitude = order.deliveryAddress.longitude;

    const hasDeliveryLocation =
        Number.isFinite(latitude) && Number.isFinite(longitude);

    // Join the customer's room to receive rider updates
    useEffect(() => {
        if (!socket || !id) return;

        const room = `user:${id}`;

        socket.emit("join", room);

        return () => {
            socket.emit("leave", room);
        };
    }, [socket, id]);

    // Listen for the rider's live location
    useEffect(() => {
        if (!socket) return;

        const onRiderLocation = (data: {
            latitude: number;
            longitude: number;
        }) => {
            if (
                !Number.isFinite(data.latitude) ||
                !Number.isFinite(data.longitude)
            ) {
                return;
            }

            setRiderLocation([data.latitude, data.longitude]);
        };

        socket.on("rider:location", onRiderLocation);

        return () => {
            socket.off("rider:location", onRiderLocation);
        };
    }, [socket]);

    if (!hasDeliveryLocation) {
        return <p>Delivery location is unavailable.</p>;
    }

    const deliveryLocation: [number, number] = [
        latitude,
        longitude,
    ];

    return (
        <div className="w-full overflow-hidden rounded-lg">
            <MapContainer
                center={riderLocation ?? deliveryLocation}
                zoom={14}
                style={{ height: "400px", width: "100%" }}
                scrollWheelZoom
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker
                    position={deliveryLocation}
                    icon={deliveryIcon}
                >
                    <Popup>Delivery Address</Popup>
                </Marker>

                {riderLocation && (
                    <>
                        <Marker
                            position={riderLocation}
                            icon={riderIcon}
                        >
                            <Popup>Rider's Current Location</Popup>
                        </Marker>

                        <Routing
                            from={riderLocation}
                            to={deliveryLocation}
                        />
                    </>
                )}
            </MapContainer>

            <p className="mt-2 text-sm text-gray-600">
                {riderLocation
                    ? "Live rider location"
                    : "Waiting for rider location..."}
            </p>
        </div>
    );
};

export default CustomerOrderMap;
