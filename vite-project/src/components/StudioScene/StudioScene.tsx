import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCursor, useGLTF, useProgress } from "@react-three/drei";
import * as THREE from "three";
import "./StudioScene.css";

const MODEL_URL = "/models/roomModel.glb";

/** Standing in the bedroom, looking toward the desk / monitors. */
const CAMERA_POSITION: [number, number, number] = [1.75, 3.05, -29.35];
const CAMERA_TARGET: [number, number, number] = [1.85, 2.85, -28.4];

const MAX_YAW = THREE.MathUtils.degToRad(50);
const YAW_SPEED = THREE.MathUtils.degToRad(32);
const CAMERA_LERP = 5.5;
const UP = new THREE.Vector3(0, 1, 0);

type ViewId = "home" | "table";
type Edge = "left" | "right" | null;

const VIEWS: Record<ViewId, { position: [number, number, number]; target: [number, number, number] }> =
  {
    home: {
      position: CAMERA_POSITION,
      target: CAMERA_TARGET,
    },
    table: {
      position: [1.72, 3.42, -28.72],
      target: [1.72, 2.79, -28.26],
    },
  };

/** Desk / tabletop meshes in the GLB — clicking any of these zooms to the table. */
const TABLE_OBJECT_NAMES = new Set([
  "02_PC",
  "02_Mouse",
  "02_Mouse Pad",
  "02_Drawing Tablet",
  "02_Pen",
  "02_Phone",
  "02_Monitor.001",
  "02_Monitor.002",
  "02_ClipBoard",
  "02_UnderDeskholder",
  "02_ACRemote.001",
]);

useGLTF.preload(MODEL_URL);

function objectMatchesTable(object: THREE.Object3D) {
  let current: THREE.Object3D | null = object;
  while (current) {
    if (TABLE_OBJECT_NAMES.has(current.name)) return true;
    current = current.parent;
  }
  return false;
}

function Room({
  view,
  onZoomTable,
}: {
  view: ViewId;
  onZoomTable: () => void;
}) {
  const { scene } = useGLTF(MODEL_URL);

  useLayoutEffect(() => {
    scene.traverse((obj) => {
      obj.castShadow = true;
      obj.receiveShadow = true;
    });
  }, [scene]);

  return (
    <primitive
      object={scene}
      onClick={(event: { object: THREE.Object3D; stopPropagation: () => void }) => {
        if (view !== "home") return;
        if (!objectMatchesTable(event.object)) return;
        event.stopPropagation();
        onZoomTable();
      }}
    />
  );
}

function TableHotspot({
  view,
  onZoomTable,
}: {
  view: ViewId;
  onZoomTable: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered && view === "home");

  return (
    <mesh
      position={[1.74, 2.785, -28.28]}
      onClick={(event) => {
        event.stopPropagation();
        if (view === "home") onZoomTable();
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[1.15, 0.07, 0.62]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

function CameraRig({
  view,
  edgeRef,
  yawRef,
}: {
  view: ViewId;
  edgeRef: RefObject<Edge>;
  yawRef: RefObject<number>;
}) {
  const { camera, gl } = useThree();
  const look = useMemo(() => new THREE.Vector3(...CAMERA_TARGET), []);
  const desiredPos = useMemo(() => new THREE.Vector3(), []);
  const desiredLook = useMemo(() => new THREE.Vector3(), []);
  const homeDir = useMemo(
    () =>
      new THREE.Vector3(
        CAMERA_TARGET[0] - CAMERA_POSITION[0],
        CAMERA_TARGET[1] - CAMERA_POSITION[1],
        CAMERA_TARGET[2] - CAMERA_POSITION[2],
      ),
    [],
  );

  useEffect(() => {
    const blockWheel = (event: WheelEvent) => event.preventDefault();
    gl.domElement.addEventListener("wheel", blockWheel, { passive: false });
    return () => gl.domElement.removeEventListener("wheel", blockWheel);
  }, [gl]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);

    if (view === "home") {
      const edge = edgeRef.current;
      if (edge === "left") yawRef.current += YAW_SPEED * dt;
      if (edge === "right") yawRef.current -= YAW_SPEED * dt;
      yawRef.current = THREE.MathUtils.clamp(yawRef.current, -MAX_YAW, MAX_YAW);

      desiredPos.set(...CAMERA_POSITION);
      desiredLook.copy(homeDir).applyAxisAngle(UP, yawRef.current);
      desiredLook.add(desiredPos);
    } else {
      const next = VIEWS[view];
      desiredPos.set(...next.position);
      desiredLook.set(...next.target);
    }

    const t = 1 - Math.exp(-CAMERA_LERP * dt);
    camera.position.lerp(desiredPos, t);
    look.lerp(desiredLook, t);
    camera.lookAt(look);
  });

  return null;
}

function Loader() {
  const { progress, active } = useProgress();

  if (!active && progress === 100) return null;

  return (
    <div className="studio-loader" aria-live="polite">
      <p>Loading studio… {Math.min(100, Math.round(progress))}%</p>
    </div>
  );
}

function edgeFromClientX(clientX: number): Edge {
  const zone = Math.max(72, window.innerWidth * 0.09);
  if (clientX < zone) return "left";
  if (clientX > window.innerWidth - zone) return "right";
  return null;
}

export function StudioScene() {
  const [view, setView] = useState<ViewId>("home");
  const [edge, setEdge] = useState<Edge>(null);
  const edgeRef = useRef<Edge>(null);
  const yawRef = useRef(0);

  function setEdgeBoth(next: Edge) {
    edgeRef.current = next;
    setEdge(next);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setView("home");
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const atHome = view === "home";

  return (
    <div
      className={`studio-root ${atHome && edge ? `edge-${edge}` : ""}`}
      onPointerMove={(event) => {
        if (!atHome) {
          setEdgeBoth(null);
          return;
        }
        setEdgeBoth(edgeFromClientX(event.clientX));
      }}
      onPointerLeave={() => setEdgeBoth(null)}
    >
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true }}
        camera={{
          fov: 55,
          near: 0.05,
          far: 200,
          position: CAMERA_POSITION,
        }}
        onCreated={({ camera }) => {
          camera.lookAt(...CAMERA_TARGET);
        }}
        onPointerMissed={() => setView("home")}
      >
        <color attach="background" args={["#b7ddff"]} />
        <fog attach="fog" args={["#b7ddff", 12, 40]} />

        <ambientLight intensity={0.55} />
        <hemisphereLight args={["#e7f3ff", "#8a7a68", 0.7]} />
        <directionalLight position={[6, 12, -18]} intensity={1.15} />

        <Suspense fallback={null}>
          <Room view={view} onZoomTable={() => setView("table")} />
          <TableHotspot view={view} onZoomTable={() => setView("table")} />
        </Suspense>

        <CameraRig view={view} edgeRef={edgeRef} yawRef={yawRef} />
      </Canvas>
      <Loader />
      {!atHome && (
        <button
          type="button"
          className="studio-back"
          onClick={() => setView("home")}
        >
          Back
        </button>
      )}
    </div>
  );
}
