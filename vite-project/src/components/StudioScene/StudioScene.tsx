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
import { useGLTF, useProgress } from "@react-three/drei";
import { EffectComposer, Vignette, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import "./StudioScene.css";
import { TABLE_OBJECT_NAMES, BED_OBJECT_NAMES, LEFT_ROOM_OBJECT_NAMES, UPPER_ROOM_OBJECT_NAMES } from "../../constants/objectNames";
const MODEL_URL = "/models/roomModel.glb";

/** Standing in the bedroom, looking toward the desk / monitors. */
const CAMERA_POSITION: [number, number, number] = [1.75, 3.05, -29.35];
const CAMERA_TARGET: [number, number, number] = [1.85, 2.85, -28.4];

const MAX_YAW = THREE.MathUtils.degToRad(40);
const YAW_SPEED = THREE.MathUtils.degToRad(20);
const MAX_PITCH = THREE.MathUtils.degToRad(10);
const PITCH_SPEED = THREE.MathUtils.degToRad(20);
const CAMERA_LERP = 5.5;
const UP = new THREE.Vector3(0, 1, 0);

type ViewId = "home" | "table" | "bed" | "pinboard" | "clock";
type EdgeX = "left" | "right" | null;
type EdgeY = "top" | "bottom" | null;

const VIEWS: Record<ViewId, { position: [number, number, number]; target: [number, number, number] }> =
{
  home: {
    position: CAMERA_POSITION,
    target: CAMERA_TARGET,
  },
  table: {
    position: [1.75, 2.95, -28.50],
    target: [1.75, 2.80, -28.30],
  },
  bed: {
    position: [1.30, 3.05, -29.20],
    target: [0.60, 2.00, -27.80],
  },
  pinboard: {
    position: [2.25, 2.92, -28.35],
    target: [6.00, 1.48, -27.80],
  },
  clock: {
    position: [1.65, 3.55, -28.65],
    target: [2.80, 3.00, -25.30],
  },
};

useGLTF.preload(MODEL_URL);

function objectMatches(object: THREE.Object3D, group: Set<string>) {
  let current: THREE.Object3D | null = object;
  while (current) {
    if (group.has(current.name)) return true;
    current = current.parent;
  }
  return false;
}

function Room({
  view,
  onZoom,
  onObjectClick,
}: {
  view: ViewId;
  onZoom: (viewId: ViewId) => void;
  onObjectClick: (name: string) => void;
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
        if (view === "home") {
          if (objectMatches(event.object, TABLE_OBJECT_NAMES)) {
            event.stopPropagation();
            onZoom("table");
          } else if (objectMatches(event.object, BED_OBJECT_NAMES)) {
            event.stopPropagation();
            onZoom("bed");
          } else if (objectMatches(event.object, LEFT_ROOM_OBJECT_NAMES)) {
            event.stopPropagation();
            onZoom("pinboard");
          } else if (objectMatches(event.object, UPPER_ROOM_OBJECT_NAMES)) {
            event.stopPropagation();
            onZoom("clock");
          }
        } else {
          event.stopPropagation();
          onObjectClick(event.object.name);
        }
      }}
    />
  );
}

import { useControls } from "leva";

function CameraRig({
  view,
  intensityXRef,
  intensityYRef,
  yawRef,
  pitchRef,
  cameraVelocityRef,
}: {
  view: ViewId;
  edgeXRef: RefObject<EdgeX>;
  edgeYRef: RefObject<EdgeY>;
  intensityXRef: RefObject<number>;
  intensityYRef: RefObject<number>;
  yawRef: RefObject<number>;
  pitchRef: RefObject<number>;
  cameraVelocityRef: RefObject<number>;
}) {
  const { camera, gl } = useThree();
  const look = useMemo(() => new THREE.Vector3(...CAMERA_TARGET), []);
  const prevCamPos = useMemo(() => new THREE.Vector3(...CAMERA_POSITION), []);
  const desiredPos = useMemo(() => new THREE.Vector3(), []);
  const desiredLook = useMemo(() => new THREE.Vector3(), []);

  const { enabled, x, y, z, tx, ty, tz } = useControls("Camera Tweaks", {
    enabled: { value: false, label: "Enable Tweaks" },
    x: { value: 1.75, step: 0.01 },
    y: { value: 3.05, step: 0.01 },
    z: { value: -29.35, step: 0.01 },
    tx: { value: 1.85, step: 0.01, label: "target x" },
    ty: { value: 2.85, step: 0.01, label: "target y" },
    tz: { value: -28.4, step: 0.01, label: "target z" },
  });

  useEffect(() => {
    const blockWheel = (event: WheelEvent) => event.preventDefault();
    gl.domElement.addEventListener("wheel", blockWheel, { passive: false });
    return () => gl.domElement.removeEventListener("wheel", blockWheel);
  }, [gl]);

  const prevViewRef = useRef<ViewId>(view);
  const transitionProgress = useRef(1);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);

    // Track view changes to drive transition easing
    if (prevViewRef.current !== view) {
      prevViewRef.current = view;
      transitionProgress.current = 0;
    }
    transitionProgress.current = Math.min(1, transitionProgress.current + dt * 1.2);

    if (enabled) {
      desiredPos.set(x, y, z);
      desiredLook.set(tx, ty, tz);
    } else if (view === "home" || view === "table") {
      const ix = intensityXRef.current;
      if (ix < 0) {
        yawRef.current += YAW_SPEED * dt * -ix * Math.max(0, 1 - yawRef.current / MAX_YAW);
      } else if (ix > 0) {
        yawRef.current -= YAW_SPEED * dt * ix * Math.max(0, 1 + yawRef.current / MAX_YAW);
      }
      yawRef.current = THREE.MathUtils.clamp(yawRef.current, -MAX_YAW, MAX_YAW);

      const iy = intensityYRef.current;
      if (view === "home") {
        if (iy < 0) {
          pitchRef.current += PITCH_SPEED * dt * -iy * Math.max(0, 1 - pitchRef.current / MAX_PITCH);
        } else if (iy > 0) {
          pitchRef.current -= PITCH_SPEED * dt * iy * Math.max(0, 1 + pitchRef.current / MAX_PITCH);
        }
        pitchRef.current = THREE.MathUtils.clamp(pitchRef.current, -MAX_PITCH, MAX_PITCH);
      } else {
        pitchRef.current *= 1 - Math.min(1, dt * 3);
      }

      const baseNext = VIEWS[view];
      const basePos = new THREE.Vector3(...baseNext.position);
      const baseTarget = new THREE.Vector3(...baseNext.target);
      const baseDir = new THREE.Vector3().subVectors(baseTarget, basePos);

      desiredPos.copy(basePos);
      desiredLook.copy(baseDir).applyAxisAngle(UP, yawRef.current);

      if (view === "home") {
        const right = new THREE.Vector3().crossVectors(desiredLook, UP).normalize();
        desiredLook.applyAxisAngle(right, pitchRef.current);
      }

      desiredLook.add(desiredPos);
    } else {
      // Smoothly decay yaw/pitch so returning to home doesn't jerk
      yawRef.current *= 1 - Math.min(1, dt * 3);
      pitchRef.current *= 1 - Math.min(1, dt * 3);

      const next = VIEWS[view];
      desiredPos.set(...next.position);
      desiredLook.set(...next.target);
    }

    // Ease-in the lerp factor during transitions for a soft start
    const ease = transitionProgress.current < 1
      ? transitionProgress.current * transitionProgress.current
      : 1;
    const lerpSpeed = THREE.MathUtils.lerp(1.5, CAMERA_LERP, ease);
    const t = 1 - Math.exp(-lerpSpeed * dt);
    camera.position.lerp(desiredPos, t);
    look.lerp(desiredLook, t);
    camera.lookAt(look);

    // Subtle camera sway — layered sine waves for organic handheld feel
    if (view == "home") {
      const elapsed = state.clock.getElapsedTime();
      const swayX = Math.sin(elapsed * 0.031) * 0.0012 + Math.sin(elapsed * 0.73) * 0.0006 / 4;
      const swayY = Math.cos(elapsed * 0.043) * 0.0009 + Math.cos(elapsed * 0.97) * 0.0004 / 4;
      camera.position.x += swayX;
      camera.position.y += swayY;
    }
    // Track camera velocity for chromatic aberration
    cameraVelocityRef.current = camera.position.distanceTo(prevCamPos) / Math.max(dt, 0.001);
    prevCamPos.copy(camera.position);
  });

  return null;
}

/** Velocity-driven postprocessing for cinematic motion feel */
function CameraEffects({ cameraVelocityRef }: { cameraVelocityRef: RefObject<number> }) {
  const offsetRef = useRef(new THREE.Vector2(0, 0));

  useFrame(() => {
    const vel = cameraVelocityRef.current ?? 0;
    // Map velocity to a subtle chromatic aberration offset
    const intensity = THREE.MathUtils.clamp(vel * 0.0008, 0, 0.004);
    offsetRef.current.set(intensity, intensity * 0.6);
  });

  return (
    <EffectComposer>
      <Vignette
        offset={0.35}
        darkness={0.45}
        blendFunction={BlendFunction.NORMAL}
      />
      <ChromaticAberration
        offset={offsetRef.current}
        blendFunction={BlendFunction.NORMAL}
        radialModulation={false}
        modulationOffset={0.0}
      />
    </EffectComposer>
  );
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

function getPanIntensity(clientX: number, clientY: number) {
  const zoneX = Math.max(72, window.innerWidth * 0.4);
  const zoneY = Math.max(72, window.innerHeight * 0.4);
  let ix = 0;
  let iy = 0;
  let edgeX: EdgeX = null;
  let edgeY: EdgeY = null;

  if (clientX < zoneX) {
    edgeX = "left";
    ix = -(1 - clientX / zoneX);
  } else if (clientX > window.innerWidth - zoneX) {
    edgeX = "right";
    ix = 1 - (window.innerWidth - clientX) / zoneX;
  }

  if (clientY < zoneY) {
    edgeY = "top";
    iy = -(1 - clientY / zoneY);
  } else if (clientY > window.innerHeight - zoneY) {
    edgeY = "bottom";
    iy = 1 - (window.innerHeight - clientY) / zoneY;
  }

  return { edgeX, edgeY, ix, iy };
}

export function StudioScene() {
  const [view, setView] = useState<ViewId>("home");
  const [edgeX, setEdgeX] = useState<EdgeX>(null);
  const [edgeY, setEdgeY] = useState<EdgeY>(null);
  const edgeXRef = useRef<EdgeX>(null);
  const edgeYRef = useRef<EdgeY>(null);
  const intensityXRef = useRef(0);
  const intensityYRef = useRef(0);
  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const cameraVelocityRef = useRef(0);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);

  function handleSetView(newView: ViewId) {
    setView(newView);
    setSelectedObject(null);
  }

  function setEdges(ex: EdgeX, ey: EdgeY, ix: number, iy: number) {
    edgeXRef.current = ex;
    setEdgeX(ex);
    edgeYRef.current = ey;
    setEdgeY(ey);
    intensityXRef.current = ix;
    intensityYRef.current = iy;
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") handleSetView("home");
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const atHome = view === "home";

  return (
    <div
      className={`studio-root ${atHome && edgeX ? `edge-${edgeX}` : ""} ${atHome && edgeY ? `edge-${edgeY}` : ""}`}
      onPointerMove={(event) => {
        if (view !== "home" && view !== "table") {
          setEdges(null, null, 0, 0);
          return;
        }
        const { edgeX, edgeY, ix, iy } = getPanIntensity(event.clientX, event.clientY);
        setEdges(edgeX, edgeY, ix, iy);
      }}
      onPointerLeave={() => setEdges(null, null, 0, 0)}
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
        onPointerMissed={() => {
          if (view !== "home") {
            setSelectedObject(null);
          } else {
            handleSetView("home");
          }
        }}
      >
        <color attach="background" args={["#b7ddff"]} />
        <fog attach="fog" args={["#b7ddff", 12, 40]} />

        <ambientLight intensity={0.55} />
        <hemisphereLight args={["#e7f3ff", "#8a7a68", 0.7]} />
        <directionalLight position={[6, 12, -18]} intensity={1.15} />

        <Suspense fallback={null}>
          <Room
            view={view}
            onZoom={(v) => handleSetView(v)}
            onObjectClick={(name) => setSelectedObject(name)}
          />
        </Suspense>

        <CameraRig
          view={view}
          edgeXRef={edgeXRef}
          edgeYRef={edgeYRef}
          intensityXRef={intensityXRef}
          intensityYRef={intensityYRef}
          yawRef={yawRef}
          pitchRef={pitchRef}
          cameraVelocityRef={cameraVelocityRef}
        />
        <CameraEffects cameraVelocityRef={cameraVelocityRef} />
      </Canvas>
      <Loader />
      {!atHome && (
        <button
          type="button"
          className="studio-back"
          onClick={() => handleSetView("home")}
        >
          Back
        </button>
      )}

      {selectedObject && (
        <div className="studio-popup">
          <div className="studio-popup-content">
            <h3>{selectedObject}</h3>
            <button type="button" onClick={() => setSelectedObject(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
