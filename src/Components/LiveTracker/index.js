import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import "leaflet/dist/leaflet.css";

// Default icon fix for Leaflet (otherwise marker icon won't show)
import L from "leaflet";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom 3D scooter overlay
function ThreeDScooter({ map, position, prevPosition }) {
  const containerRef = useRef();
  const modelRef = useRef();

  useEffect(() => {
    if (!map || !position || !containerRef.current) return;

    // Create 3D scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(120, 120);
    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(renderer.domElement);

    const loader = new GLTFLoader();
    loader.load("/models/scooter.glb", (gltf) => {
      const model = gltf.scene;
      scene.add(model);
      modelRef.current = model;

      const animate = () => {
        requestAnimationFrame(animate);
        model.rotation.y += 0.01;
        renderer.render(scene, camera);
      };
      animate();
    });

    return () => {
      if (renderer.domElement && containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [map]);

  useEffect(() => {
    if (!modelRef.current || !prevPosition || !position) return;
    const angle = Math.atan2(
      position.lng - prevPosition.lng,
      position.lat - prevPosition.lat
    );
    modelRef.current.rotation.y = -angle;
  }, [position, prevPosition]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }}
    />
  );
}

function AutoPanMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.panTo(position);
  }, [position]);
  return null;
}

export default function LiveTracker({ vin }) {
  const [points, setPoints] = useState([]);
  const [currentPos, setCurrentPos] = useState(null);
  const [prevPos, setPrevPos] = useState(null);

  // Fetch GPS every 1s
  useEffect(() => {
    if (!vin) return;

    const fetchLiveData = async () => {
      try {
        const res = await fetch(
          `https://commandcenter.rivotmotors.com/livemaploction.php?vin=${vin}`
        );
        const json = await res.json();

        if (json.status === "success" && json.data?.lat_long) {
          const [latStr, lngStr] = json.data.lat_long.split(",");
          const newPoint = {
            lat: parseFloat(latStr.trim()),
            lng: parseFloat(lngStr.trim()),
          };

          setPoints((prev) => {
            if (
              !prev.length ||
              prev[prev.length - 1].lat !== newPoint.lat ||
              prev[prev.length - 1].lng !== newPoint.lng
            ) {
              setPrevPos(prev[prev.length - 1]);
              return [...prev, newPoint];
            }
            return prev;
          });

          setCurrentPos(newPoint);
        }
      } catch (err) {
        console.error("Live fetch error:", err);
      }
    };

    const interval = setInterval(fetchLiveData, 1000);
    return () => clearInterval(interval);
  }, [vin]);

  return (
    <div style={{ height: "100%", width: "100%" }}>
     <MapContainer
  center={currentPos || [20.5937, 78.9629]}
  zoom={6}
  minZoom={3}           // allow zoom out like Google Maps
  maxZoom={21}          // max zoom like Google Maps
  scrollWheelZoom={true}
  zoomControl={true}    // show zoom buttons
  style={{ height: "100%", width: "100%" }}
  dragging={true}
  doubleClickZoom={true}
  zoomAnimation={true}   // smooth zoom
  inertia={true}         // smooth panning
>
  <TileLayer
    attribution='© OpenStreetMap contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />

  {points.length > 1 && <Polyline positions={points} color="#00BFFF" weight={4} opacity={0.9} />}

  {currentPos && (
    <>
      <Marker position={currentPos}>
        <Popup>
          <strong>Vehicle VIN:</strong> {vin}
          <br />
          <strong>Lat:</strong> {currentPos.lat.toFixed(5)}
          <br />
          <strong>Lng:</strong> {currentPos.lng.toFixed(5)}
        </Popup>
      </Marker>

      <AutoPanMap position={currentPos} />
    </>
  )}
</MapContainer>

    </div>
  );
}
