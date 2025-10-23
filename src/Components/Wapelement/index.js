import React, { useState, useEffect, useRef } from "react";
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

// ---- Marker icons ----
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

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

// ---- Fit map to points ----
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


// call this with the `nearest` object
const getCurrentSplit = (nearest) => {
  // parse into a number safely
  const raw = nearest?.currentconsumption;
  const num = raw === null || raw === undefined ? NaN : parseFloat(raw);

  if (Number.isNaN(num) || num === 0) {
    return { consumption: "-", generation: "-" };
  }

  if (num < 0) {
    // consumption: show positive number
    return { consumption: Math.abs(num).toFixed(2), generation: "-" };
  } else {
    // generation: positive value
    return { consumption: "-", generation: num.toFixed(2) };
  }
};


// ---- Direction arrows ----
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
            pathOptions: { color: "yellow", weight: 2, opacity: 0.9 },
          }),
        },
      ],
    });
    decorator.options.className = "arrow-decorator";
    decorator.addTo(map);
  }, [positions, map]);
  return null;
}

// ---- Tooltip Handler ----
function TooltipHandler({ points, rawData, tooltipRef, selectedOptions }) {
  const map = useMap();

  const generateTooltipHTML = (nearest) => {
    if (!nearest) return "";

const { consumption, generation } = getCurrentSplit(nearest);

const fields = {
  "Speed (km/h)": `<b>Speed (km/h):</b> ${nearest.speed_kmph ?? "-"} `,
  "Battery voltage (V)": `<b>Battery voltage (V):</b> ${nearest.batvoltage ?? "-"} `,
  "SOC (%)": `<b>SOC (%):</b> ${nearest.soc ?? "-"}`,
  "Trip (km)": `<b>Trip (km):</b> ${nearest.tripkm ?? "-"} `,
  "Lat-long": `<b>Location:</b> ${nearest.lat ?? "-"}, ${nearest.lng ?? "-"}`,

  // ✅ Corrected consumption/generation fields
  "Current consumption (A)": `<b>Current consumption (A):</b> ${
    nearest.currentConsumption && nearest.currentConsumption !== 0
      ? nearest.currentConsumption.toFixed(2) + " A"
      : "-"
  }`,

  "Current generation (A)": `<b>Current generation (A):</b> ${
    nearest.currentGeneration && nearest.currentGeneration !== 0
      ? nearest.currentGeneration.toFixed(2) + " A"
      : "-"
  }`,

  "Motor temp (°C)": `<b>Motor temp (°C):</b> ${nearest.motortemp ?? "-"} `,
  "Controller mosfet temp (°C)": `<b>Controller mosfet temp (°C):</b> ${nearest.controllermostemp ?? "-"} `,
  "Inah (Ah)": `<b>Inah (Ah):</b> ${nearest.inah ?? "-"} `,
  "Outah (Ah)": `<b>Outah (Ah):</b> ${nearest.outah ?? "-"} `,

  "Positive terminal temp (°C)": `<b>Positive terminal temp (°C):</b> ${nearest.ntc?.posTerminal ?? "-"} `,
  "Cell No. 20 temp (°C)": `<b>Cell No. 20 temp (°C):</b> ${nearest.ntc?.cell20 ?? "-"} `,
  "Cell No. 28 temp (°C)": `<b>Cell No. 28 temp (°C):</b> ${nearest.ntc?.cell28 ?? "-"} `,
  "Negative terminal temp (°C)": `<b>Negative terminal temp (°C):</b> ${nearest.ntc?.negTerminal ?? "-"} `,

  "Main charge mosfet": `<b>Main charge mosfet:</b> ${nearest.mos?.mainCharge ?? "-"}`,
  "Main discharge mosfet": `<b>Main discharge mosfet:</b> ${nearest.mos?.mainDischarge ?? "-"}`,
  "APU charge mosfet": `<b>APU charge mosfet:</b> ${nearest.mos?.apuCharge ?? "-"}`,
  "APU discharge mosfet": `<b>APU discharge mosfet:</b> ${nearest.mos?.apuDischarge ?? "-"}`,

  "Time": `<b>Time:</b> ${nearest.time ?? "-"}`
};

  // Generate HTML string for selected fields
  // return selectedOptions.map(opt => fields[opt]).filter(Boolean).join("<br/>");



    const toDisplay = selectedOptions && selectedOptions.length > 0 ? [...selectedOptions, "Time","Lat-long"] : [];
    if (toDisplay.length === 0) return "";

    return `
      <div style="
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 6px 10px;
        border-radius: 8px;
        font-size: 12px;
        max-width: 250px;
      ">
        ${toDisplay.map((key) => fields[key]).filter(Boolean).join("<br/>")}
      </div>
    `;
  };

  useEffect(() => {
    if (!map || !points || points.length < 2) return;

    const handleMouseMove = (e) => {
      if (!tooltipRef.current) return;
      const latlng = e.latlng;
      let nearest = null;
      let minDist = Infinity;

      for (let i = 0; i < points.length - 1; i++) {
        const p1 = L.latLng(points[i]);
        const p2 = L.latLng(points[i + 1]);
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
        tooltipRef.current.innerHTML = generateTooltipHTML(nearest);
        tooltipRef.current.style.display = "block";

        const mapRect = map.getContainer().getBoundingClientRect();
        tooltipRef.current.style.left = e.originalEvent.clientX - mapRect.left + 15 + "px";
        tooltipRef.current.style.top = e.originalEvent.clientY - mapRect.top + 10 + "px";
      } else {
        tooltipRef.current.style.display = "none";
      }
    };

    map.on("mousemove", handleMouseMove);
    map.on("mouseout", () => {
      if (tooltipRef.current) tooltipRef.current.style.display = "none";
    });

    return () => map.off("mousemove", handleMouseMove);
  }, [map, points, rawData, selectedOptions]);

  return null;
}


// ---- Main Component ----
export default function Wapelement({ vin, start, end, applyFilter,setSelectedOptions, selectedOptions = [] }) {
  const [points, setPoints] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);
  const tooltipRef = useRef(null);

  // ✅ Copy Lat-Long on Ctrl + C
// ✅ Copy only Lat-Long on Ctrl + C when tooltip is visible
useEffect(() => {
  const handleCopyLatLong = (e) => {
    if (e.ctrlKey && e.code === "KeyC" && tooltipRef.current && tooltipRef.current.style.display === "block") {
      const tooltipText = tooltipRef.current.innerText;
      const match = tooltipText.match(/Location:\s*([\d.\-]+),\s*([\d.\-]+)/);
      if (match) {
        const latlon = `${match[1]}, ${match[2]}`;
        navigator.clipboard.writeText(latlon)
          .then(() => {
            console.log(`✅ Copied Lat,Lng: ${latlon}`);
          })
          .catch((err) => console.error("❌ Copy failed:", err));
      } else {
        console.log("No Lat-Long found in tooltip");
      }
    }
  };

  window.addEventListener("keydown", handleCopyLatLong);
  return () => window.removeEventListener("keydown", handleCopyLatLong);
}, []);




  useEffect(() => {
    if (!vin || !start || !end) {
      setPoints([]);
      return;
    }

    setLoading(true);

const fetchRoute = async () => {
  try {
    const res = await fetch(
      `https://commandcenter.rivotmotors.com/geolocationhistory.php?vin=${vin}&start=${encodeURIComponent(
        start
      )}&end=${encodeURIComponent(end)}`
    );
    const json = await res.json();

    // ---- Helper functions ----
    const extractMOS = (ntcArray) => {
      if (!Array.isArray(ntcArray)) return [];

      const mosIndex = ntcArray.findIndex(
        (v) => typeof v === "string" && v.includes("MOS=")
      );
      if (mosIndex === -1) return [];

      const first = Number(ntcArray[mosIndex].split("MOS=")[1]);
      const rest = ntcArray.slice(mosIndex + 1, mosIndex + 4).map(Number);

      const mosNums = [first, ...rest];
      return mosNums.map((v) => (v === 1 ? "ON" : v === 0 ? "OFF" : "-"));
    };

    const extractNTC = (ntcArray) => {
      if (!Array.isArray(ntcArray)) return [];

      const ntcIndex = ntcArray.findIndex(
        (v) => typeof v === "string" && v.includes("ntc=")
      );
      if (ntcIndex === -1) return [];

      const ntcVals = ntcArray.slice(ntcIndex, ntcIndex + 4);

      if (typeof ntcVals[0] === "string" && ntcVals[0].includes("ntc=")) {
        ntcVals[0] = Number(ntcVals[0].split("ntc=")[1]);
      }

      return ntcVals;
    };

    // ---- Parse Data ----
    if (json.status === "success" && json.data.length > 0) {
      const route = json.data
        .map((p) => {
          const ntcArray = p.ntc_array || p.ntc || [];

          const mosVals = extractMOS(ntcArray); // ["ON","OFF","ON","OFF"]
          const ntcVals = extractNTC(ntcArray); // [30, 27, 30, 29]

          // Split current consumption/generation
          const currentValue = Number(p.currentconsumption) || 0;
          const currentGeneration = currentValue > 0 ? currentValue : 0;
          const currentConsumption = currentValue < 0 ? Math.abs(currentValue) : 0;
          console.log("currentonsumption",currentConsumption);
                    console.log("currentgenration",currentGeneration);
          

          return {
            lat: parseFloat(p.lat),
            lng: parseFloat(p.lng),
            speed_kmph: p.speed_kmph,
            soc: p.soc,
            tripkm: p.tripkm,
            batvoltage: p.batvoltage,
            motortemp: p.motortemp,
            controllermostemp: p.controllermostemp,
            currentGeneration,       // positive value only
            currentConsumption,      // negative value converted to positive
            inah: p.inah,
            outah: p.outah,
            mos: {
              mainCharge: mosVals[0] ?? "-",
              mainDischarge: mosVals[1] ?? "-",
              apuCharge: mosVals[2] ?? "-",
              apuDischarge: mosVals[3] ?? "-",
            },
            ntc: {
              posTerminal: ntcVals[0] ?? "-",
              cell20: ntcVals[1] ?? "-",
              cell28: ntcVals[2] ?? "-",
              negTerminal: ntcVals[3] ?? "-",
            },
            time: p.time,
          };
        })
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
};


    fetchRoute();
  }, [vin, start, end, applyFilter]);

  const center = points.length > 0 ? points[0] : { lat: 20.5937, lng: 78.9629 };

  // Default always shows Lat-long


// Optional: protect Lat-long from being unchecked
const handleCheckboxChange = (item) => {
  if (item === "Lat-long") return;
  if (selectedOptions.includes(item)) {
    setSelectedOptions(selectedOptions.filter((i) => i !== item));
  } else {
    setSelectedOptions([...selectedOptions, item]);
  }
};


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
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <AutoFitMap points={points} />
        {points.length > 0 && (
          <>
            <Polyline positions={points} pathOptions={{ color: "blue", weight: 5, opacity: 0.9 }} />
            <DirectionArrows positions={points} />
            <Marker position={points[0]} icon={startIcon} />
            <Marker position={points[points.length - 1]} icon={endIcon} />
          </>
        )}
        <TooltipHandler
          points={points}
          rawData={rawData}
          tooltipRef={tooltipRef}
          selectedOptions={selectedOptions}
          
        />
      </MapContainer>

      {/* Floating tooltip */}
      <div
        className="absolute text-xs sm:text-sm md:text-base max-w-[220px] sm:max-w-[250px] md:max-w-[300px] shadow-lg"
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
