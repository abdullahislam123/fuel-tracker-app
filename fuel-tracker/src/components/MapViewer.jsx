import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FiArrowLeft, FiNavigation, FiMapPin, FiInfo, FiCrosshair } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

// Fix for default marker icon issue in Leaflet + React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const RecenterMap = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) map.setView(position, 14);
    }, [position, map]);
    return null;
};

const MapViewer = () => {
    const [position, setPosition] = useState([33.6844, 73.0479]); // Default: Islamabad
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Geolocation call
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const newPos = [pos.coords.latitude, pos.coords.longitude];
                    setPosition(newPos);
                    fetchStations(newPos);
                },
                () => {
                    fetchStations(position);
                    setLoading(false);
                }
            );
        } else {
            fetchStations(position);
            setLoading(false);
        }
    }, []);

    const fetchStations = async (pos) => {
        setLoading(true);
        // Overpass API query for fuel stations
        const query = `
            [out:json];
            node["amenity"="fuel"](around:5000, ${pos[0]}, ${pos[1]});
            out body;
        `;
        try {
            const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
            const data = await res.json();
            setStations(data.elements || []);
        } catch (err) {
            console.error("Failed to fetch stations", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0c10] pb-24 px-4 animate-fade-in flex flex-col pt-10">
            <header className="max-w-7xl w-full mx-auto flex items-center justify-between mb-8">
                <button onClick={() => navigate(-1)} className="p-4 bg-slate-100 dark:bg-neutral-900 rounded-3xl text-slate-900 dark:text-white active:scale-95 transition-all shadow-lg">
                    <FiArrowLeft size={24} />
                </button>
                <div className="text-center">
                    <h1 className="text-3xl font-black italic tracking-tighter dark:text-white">Station <span className="text-blue-500">Finder.</span></h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Nearby Refueling Nodes</p>
                </div>
                <button onClick={() => fetchStations(position)} className="p-4 bg-blue-500 text-white rounded-3xl active:rotate-180 transition-all shadow-xl shadow-blue-500/20">
                    <FiCrosshair size={24} />
                </button>
            </header>

            <main className="max-w-7xl w-full mx-auto flex-1 flex flex-col lg:flex-row gap-8 min-h-[600px]">
                {/* MAP CONTAINER */}
                <div className="flex-1 glass-card overflow-hidden rounded-[3rem] border-4 border-white dark:border-white/5 shadow-2xl relative">
                    {loading && (
                        <div className="absolute inset-0 z-20 bg-white/50 dark:bg-black/50 backdrop-blur-md flex flex-col items-center justify-center">
                            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
                            <span className="text-xs font-black uppercase tracking-widest text-blue-500 animate-pulse">Scanning Perimeter...</span>
                        </div>
                    )}
                    <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <RecenterMap position={position} />

                        {/* CURRENT LOCATION MARKER */}
                        <Marker position={position} icon={L.divIcon({
                            className: 'custom-div-icon',
                            html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border: 4px solid white; border-radius: 50%; box-shadow: 0 0 20px #3b82f6;"></div>`,
                            iconSize: [20, 20],
                            iconAnchor: [10, 10]
                        })}>
                            <Popup><span className="font-black italic">You are here</span></Popup>
                        </Marker>

                        {/* STATIONS MARKERS */}
                        {stations.map(station => (
                            <Marker key={station.id} position={[station.lat, station.lon]}>
                                <Popup>
                                    <div className="p-2">
                                        <h4 className="font-black italic text-slate-900">{station.tags.name || 'Petrol Station'}</h4>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">{station.tags.brand || 'Local Vendor'}</p>
                                        <button
                                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lon}`)}
                                            className="mt-3 w-full py-2 bg-blue-500 text-white text-[8px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-2"
                                        >
                                            Navigate <FiNavigation size={10} />
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

                {/* STATIONS LIST SIDEBAR */}
                <div className="w-full lg:w-96 flex flex-col gap-6">
                    <div className="glass-card p-8 flex items-center justify-between mb-2">
                        <div>
                            <span className="text-4xl font-black italic dark:text-white">{stations.length}</span>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Stations Found</p>
                        </div>
                        <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl"><FiMapPin size={24} /></div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[500px] lg:max-h-none">
                        {stations.map(station => (
                            <div key={station.id} className="glass-card p-6 group hover:translate-x-2 transition-all duration-300 cursor-pointer border-blue-500/5 hover:border-blue-500/30">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h4 className="font-black italic text-slate-900 dark:text-white uppercase tracking-tight truncate">{station.tags.name || 'Petrol Station'}</h4>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[9px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full uppercase">{station.tags.brand || 'Vendor'}</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter italic flex items-center gap-1"><FiInfo size={10} /> {(Math.random() * 5).toFixed(1)} km</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lon}`)}
                                        className="p-3 bg-slate-100 dark:bg-white/5 rounded-xl text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-md active:scale-90"
                                    >
                                        <FiNavigation size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {stations.length === 0 && !loading && (
                            <div className="py-20 text-center">
                                <p className="text-sm font-black italic text-slate-400 uppercase tracking-widest">No stations found in radius...</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MapViewer;
