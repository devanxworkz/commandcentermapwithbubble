import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-polylinedecorator";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Auto-fit map to route bounds
function AutoFitMap({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points || points.length === 0) return;
    if (points.length === 1) map.setView(points[0], 21);
    else {
      const bounds = L.latLngBounds(points);
      map.flyToBounds(bounds, { padding: [50, 50] });
      if (map.getZoom() > 22) map.setZoom(22);
    }
  }, [points, map]);
  return null;
}

// Direction arrows
function DirectionArrows({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (!positions || positions.length < 2) return;
    map.eachLayer((layer) => {
      if (layer.options && layer.options.className === "arrow-decorator") {
        map.removeLayer(layer);
      }
    });
    const decorator = L.polylineDecorator(L.polyline(positions), {
      patterns: [
        {
          offset: 20,
          repeat: 60,
          symbol: L.Symbol.arrowHead({
            pixelSize: 8,
            polygon: true,
            pathOptions: { color: "black", weight: 2, opacity: 0.9 },
          }),
        },
      ],
    });
    decorator.options.className = "arrow-decorator";
    decorator.addTo(map);
  }, [positions, map]);
  return null;
}

// Custom icons
const startIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});
const endIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149060.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Tooltip handler for polyline hover
function TooltipHandler({ points, rawData, tooltipRef }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !points || points.length < 2) return;

    const handleMouseMove = (e) => {
      if (!tooltipRef.current) return;

      const latlng = e.latlng;
      let nearest = null;
      let minDist = Infinity;

      for (let i = 0; i < points.length - 1; i++) {
        const p1 = L.latLng(points[i].lat, points[i].lng);
        const p2 = L.latLng(points[i + 1].lat, points[i + 1].lng);
        const dist = L.LineUtil.pointToSegmentDistance(
          map.latLngToLayerPoint(latlng),
          map.latLngToLayerPoint(p1),
          map.latLngToLayerPoint(p2)
        );
        if (dist < minDist) {
          minDist = dist;
          nearest = rawData[i];
        }
      }

      if (nearest && minDist < 20) {
        tooltipRef.current.innerHTML = `
          <div style="background:rgba(0,0,0,0.8);color:#fff;padding:6px 10px;border-radius:8px;font-size:12px;">
            <b>Speed:</b> ${nearest.speed_kmph || "-"} km/h<br/>
            <b>Battery Voltage:</b> ${nearest.batvoltage || "-"} V<br/>
            <b>SOC:</b> ${nearest.soc || "-"}%<br/>
            <b>Trip:</b> ${nearest.tripkm || "-"} km<br/>
            <b>Time:</b> ${nearest.time || "-"}
          </div>`;
        tooltipRef.current.style.display = "block";
        tooltipRef.current.style.left = e.originalEvent.pageX + 10 + "px";
        tooltipRef.current.style.top = e.originalEvent.pageY - 30 + "px";
      } else {
        tooltipRef.current.style.display = "none";
      }
    };

    const handleMouseOut = () => {
      if (tooltipRef.current) tooltipRef.current.style.display = "none";
    };

    map.on("mousemove", handleMouseMove);
    map.on("mouseout", handleMouseOut);

    return () => {
      map.off("mousemove", handleMouseMove);
      map.off("mouseout", handleMouseOut);
    };
  }, [map, points, rawData, tooltipRef]);

  return null;
}

export default function Wapelement({ vin, start, end, applyFilter }) {
  const [points, setPoints] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!vin || !start || !end) {
      setPoints([]);
      return;
    }
    setLoading(true);

    async function fetchRoute() {
      try {
        const res = await fetch(
          `https://ble.nerdherdlab.com/geolocationhistory.php?vin=${vin}&start=${encodeURIComponent(
            start
          )}&end=${encodeURIComponent(end)}`
        );
        const json = await res.json();

        if (json.status === "success" && json.data.length > 0) {
          const route = json.data
            .map((p) => ({
              lat: parseFloat(p.lat),
              lng: parseFloat(p.lng),
              speed_kmph: p.speed_kmph,
              soc: p.soc,
              tripkm: p.tripkm,
              time: p.time,
              batvoltage:p.batvoltage
            }))
            .filter((p) => p.lat && p.lng);

          setPoints(route.map((p) => ({ lat: p.lat, lng: p.lng })));
          setRawData(route);
        } else {
          setPoints([]);
          setRawData([]);
        }
      } catch (err) {
        console.error(err);
        setPoints([]);
        setRawData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRoute();
  }, [vin, start, end, applyFilter]);

  const center = points.length > 0 ? points[0] : { lat: 20.5937, lng: 78.9629 };

  return (
    <div style={{ height: "100%", width: "100%" }}>
      {loading && <div className="text-white p-4">Loading route...</div>}

      <MapContainer
        center={center}
        zoom={14}
        minZoom={5}
        maxZoom={25}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <AutoFitMap points={points} />

        {points.length > 0 && (
          <>
            <Polyline
              positions={points}
              pathOptions={{ color: "blue", weight: 5, opacity: 0.9 }}
            />
            <DirectionArrows positions={points} />
            <Marker position={points[0]} icon={startIcon}></Marker>
            <Marker position={points[points.length - 1]} icon={endIcon}></Marker>
          </>
        )}

        <TooltipHandler points={points} rawData={rawData} tooltipRef={tooltipRef} />
      </MapContainer>

      {/* Floating tooltip */}
      <div
        ref={tooltipRef}
        style={{
          position: "absolute",
          pointerEvents: "none",
          display: "none",
          zIndex: 9999,
        }}
      />
    </div>
  );
}
