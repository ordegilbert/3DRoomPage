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
import { useGLTF, useTexture, useProgress, Html, ContactShadows } from "@react-three/drei";
import { EffectComposer, Vignette, ChromaticAberration, Bloom } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import "./StudioScene.css";
import { TABLE_OBJECT_NAMES, BED_OBJECT_NAMES, LEFT_ROOM_OBJECT_NAMES, UPPER_ROOM_OBJECT_NAMES, CUSTOM_OBJECT_LABELS } from "../../constants/objectNames";
import { ContactPopup } from "../Popups/ContactPopup";
import { WishlistPopup } from "../Popups/WishlistPopup";

const POPUP_COMPONENTS: Record<string, React.FC> = {
  "02_Clock": ContactPopup,
  "Clock": ContactPopup,
  "02_Monitor002": WishlistPopup,
  "LandScapeMonitor": WishlistPopup
};

// const MODEL_URL = "/models/roomModel.glb";
const MODEL_URL = "/models/TexturedModel/WebsiteTextured.glb";
const EXTERIOR_TEXTURE_URL = "/models/TexturedModel/textures/Exterior.png";

type NavButton = {
  label: string;
  defaultImg: string;
  hoverImg: string;
} & (
    | { action: "zoom"; viewId: ViewId }
    | { action: "object"; objectId: string; objectLabel: string }
  );

const NAV_BUTTONS: Record<ViewId, NavButton[]> = {
  home: [
    { label: "Silent Trip", defaultImg: "assets/SilentTrip_default.png", hoverImg: "assets/SilentTrip_hover.png", action: "zoom", viewId: "table" },
    { label: "Contact Us", defaultImg: "assets/ContactUs_default.png", hoverImg: "assets/ContactUs_hover.png", action: "zoom", viewId: "bed" },
    { label: "Press Kit", defaultImg: "assets/PressKit_default.png", hoverImg: "assets/PressKit_hover.png", action: "zoom", viewId: "pinboard" },
    { label: "About Us", defaultImg: "assets/AboutUs_default.png", hoverImg: "assets/AboutUs_hover.png", action: "zoom", viewId: "clock" },
  ],
  table: [
    { label: "Wishlist", defaultImg: "assets/Wishlist_default.png", hoverImg: "assets/Wishlist_hover.png", action: "object", objectId: "LandScapeMonitor", objectLabel: "Wishlist" },
    { label: "Socials", defaultImg: "assets/Socials_defauly.png", hoverImg: "assets/Socials_hover.png", action: "object", objectId: "Phone", objectLabel: "Socials" },
    { label: "Fan Art", defaultImg: "assets/FanArt_default.png", hoverImg: "assets/FanArt_hover.png", action: "object", objectId: "ClipBoard", objectLabel: "Fan Art" },
    { label: "Press Kit", defaultImg: "assets/PressKit_default.png", hoverImg: "assets/PressKit_hover.png", action: "object", objectId: "DrawingTablet", objectLabel: "Press Kit" },
  ],
  bed: [
    { label: "Contact Us", defaultImg: "assets/ContactUs_default.png", hoverImg: "assets/ContactUs_hover.png", action: "object", objectId: "Bed", objectLabel: "Contact Us" },
  ],
  pinboard: [
    { label: "Press Kit", defaultImg: "assets/PressKit_default.png", hoverImg: "assets/PressKit_hover.png", action: "object", objectId: "Standing_Painting", objectLabel: "Press Kit" },
  ],
  clock: [
    { label: "About Us", defaultImg: "assets/AboutUs_default.png", hoverImg: "assets/AboutUs_hover.png", action: "object", objectId: "Clock", objectLabel: "About Us" },
  ],
};

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
useTexture.preload(EXTERIOR_TEXTURE_URL);

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
  isLoaded,
  isDraggingRef,
}: {
  view: ViewId;
  onZoom: (viewId: ViewId) => void;
  onObjectClick: (obj: { id: string; label: string; position: "left" | "right" }) => void;
  isLoaded: boolean;
  isDraggingRef: RefObject<boolean>;
}) {
  const { scene } = useGLTF(MODEL_URL);
  const exteriorTexture = useTexture(EXTERIOR_TEXTURE_URL);

  useLayoutEffect(() => {
    exteriorTexture.flipY = false;
    exteriorTexture.colorSpace = THREE.SRGBColorSpace;

    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;

        // Floor, walls, and road must RECEIVE shadows, but NOT cast shadows onto the interior
        if (
          obj.name === "FloorEdge" ||
          obj.name === "Carpet" ||
          obj.name === "Road" ||
          obj.name.startsWith("ExteriorHouse")
        ) {
          mesh.castShadow = false;
          mesh.receiveShadow = true;
        } else {
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }

        const applyTexture = (mat: THREE.Material) => {
          if (mat.name === "Exterior" || obj.name.startsWith("ExteriorHouse")) {
            (mat as THREE.MeshStandardMaterial).map = exteriorTexture;
            mat.needsUpdate = true;
          }
        };

        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(applyTexture);
        } else if (mesh.material) {
          applyTexture(mesh.material);
        }
      }
    });
  }, [scene, exteriorTexture]);

  const activeObjects = useMemo(() => {
    const roomCenter = new THREE.Vector3(1.75, 2.5, -28.4);
    const dummy = new THREE.Object3D();

    if (view === "home") {
      const homeLabels: Record<string, { label: string, view: ViewId }> = {
        "02_Chair": { label: "Silent Trip", view: "table" },
        "Chair": { label: "Silent Trip", view: "table" },
        "02_Picture": { label: "Contact Us", view: "bed" },
        "Posters": { label: "Contact Us", view: "bed" },
        "02_Canvas": { label: "Press Kit", view: "pinboard" },
        "Standing_Painting": { label: "Press Kit", view: "pinboard" },
        "02_Clock": { label: "About Us", view: "clock" },
        "Clock": { label: "About Us", view: "clock" }
      };
      const list: { name: string; label: string; position: [number, number, number]; rotation: [number, number, number]; viewId?: ViewId }[] = [];
      scene.traverse((obj) => {
        if (homeLabels[obj.name]) {
          const box = new THREE.Box3().setFromObject(obj);
          const center = new THREE.Vector3();
          box.getCenter(center);

          dummy.position.copy(center);
          dummy.lookAt(roomCenter);

          list.push({
            name: obj.name,
            label: homeLabels[obj.name].label,
            position: [center.x, center.y, center.z],
            rotation: [dummy.rotation.x, dummy.rotation.y, dummy.rotation.z],
            viewId: homeLabels[obj.name].view
          });
        }
      });
      return list;
    }

    const names = view === "table" ? TABLE_OBJECT_NAMES :
      view === "bed" ? BED_OBJECT_NAMES :
        view === "pinboard" ? LEFT_ROOM_OBJECT_NAMES :
          view === "clock" ? UPPER_ROOM_OBJECT_NAMES : new Set<string>();

    const list: { name: string; label: string; position: [number, number, number]; rotation: [number, number, number]; viewId?: ViewId }[] = [];
    scene.traverse((obj) => {
      if (names.has(obj.name) && CUSTOM_OBJECT_LABELS[obj.name]) {
        const box = new THREE.Box3().setFromObject(obj);
        const center = new THREE.Vector3();
        box.getCenter(center);

        dummy.position.copy(center);
        dummy.lookAt(roomCenter);

        list.push({
          name: obj.name,
          label: CUSTOM_OBJECT_LABELS[obj.name],
          position: [center.x, center.y, center.z],
          rotation: [dummy.rotation.x, dummy.rotation.y, dummy.rotation.z]
        });
      }
    });
    return list;
  }, [view, scene]);

  return (
    <group>
      <primitive
        object={scene}
        onClick={(event: any) => {
          if (isDraggingRef.current) return;
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
            let current: THREE.Object3D | null = event.object;
            let customLabel = null;
            let objectId = null;
            while (current) {
              if (CUSTOM_OBJECT_LABELS[current.name]) {
                customLabel = CUSTOM_OBJECT_LABELS[current.name];
                objectId = current.name;
                break;
              }
              current = current.parent;
            }

            if (customLabel && objectId) {
              event.stopPropagation();
              const position = event.clientX > window.innerWidth / 2 ? "left" : "right";
              onObjectClick({ id: objectId, label: customLabel, position });
            }
          }
        }}
      />
      {isLoaded && activeObjects.map((item, i) => (
        <Html key={i} position={item.position} sprite center transform distanceFactor={1.5} zIndexRange={[100, 0]} style={{ pointerEvents: "auto" }}>
          <div
            className={`floating-icon item-${item.name.replace(/[^a-zA-Z0-9]/g, '-')}${view !== "home" ? " in-view" : ""}`}
            onClick={(e) => {
              if (isDraggingRef.current) return;
              e.stopPropagation();
              if (view === "home" && item.viewId) {
                onZoom(item.viewId);
              } else {
                const position = e.clientX > window.innerWidth / 2 ? "left" : "right";
                onObjectClick({ id: item.name, label: item.label, position });
              }
            }}
          >
            <span className="text">{item.label}</span>
            <div className="hover-icon"></div>
          </div>
        </Html>
      ))}
    </group>
  );
}


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

    if (view === "home" || view === "table") {
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
      <Bloom
        luminanceThreshold={0.85}
        intensity={0.35}
        mipmapBlur
      />
    </EffectComposer>
  );
}

function Loader({ onLoaded }: { onLoaded: () => void }) {
  const { progress, active } = useProgress();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [fading, setFading] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const isDone = !active && progress === 100 && minTimeElapsed;

  useEffect(() => {
    if (isDone && !fading) {
      setFading(true);
    }
  }, [isDone, fading]);

  if (removed) return null;

  return (
    <div
      className={`studio-loader${fading ? " fade-out" : ""}`}
      aria-live="polite"
      onAnimationEnd={() => {
        if (fading) {
          setRemoved(true);
          onLoaded();
        }
      }}
    >
      <div>
        <img src="./Loading.gif" alt="Loading Bawang" />
      </div>
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
  const [selectedObject, setSelectedObject] = useState<{ id: string; label: string; position: "left" | "right" } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const handleLoaded = useMemo(() => () => setIsLoaded(true), []);

  const isDraggingRef = useRef(false);
  const isPointerDownRef = useRef(false);
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const lastPointerPosRef = useRef({ x: 0, y: 0 });

  const sunTarget = useMemo(() => {
    const t = new THREE.Object3D();
    t.position.set(1.75, 2.5, -28.4);
    return t;
  }, []);

  const ceilingLampTarget = useMemo(() => {
    const t = new THREE.Object3D();
    t.position.set(1.75, 2.46, -28.7);
    return t;
  }, []);

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

  useEffect(() => {
    function onGlobalPointerUp() {
      isPointerDownRef.current = false;
      if (isDraggingRef.current) {
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 60);
      }
    }
    window.addEventListener("pointerup", onGlobalPointerUp);
    window.addEventListener("pointercancel", onGlobalPointerUp);
    return () => {
      window.removeEventListener("pointerup", onGlobalPointerUp);
      window.removeEventListener("pointercancel", onGlobalPointerUp);
    };
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (selectedObject) return;
    isPointerDownRef.current = true;
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    lastPointerPosRef.current = { x: event.clientX, y: event.clientY };
    isDraggingRef.current = false;
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (selectedObject || (view !== "home" && view !== "table")) {
      setEdges(null, null, 0, 0);
      return;
    }

    // Preserve existing edge panning for mouse interaction when not actively dragging
    if (event.pointerType === "mouse" && !isDraggingRef.current) {
      const { edgeX, edgeY, ix, iy } = getPanIntensity(event.clientX, event.clientY);
      setEdges(edgeX, edgeY, ix, iy);
    }

    // Drag-to-pan when touch or pointer is pressed down
    if (isPointerDownRef.current) {
      const dx = event.clientX - lastPointerPosRef.current.x;
      const dy = event.clientY - lastPointerPosRef.current.y;
      const distFromStart = Math.hypot(
        event.clientX - pointerStartRef.current.x,
        event.clientY - pointerStartRef.current.y
      );

      if (distFromStart > 6) {
        isDraggingRef.current = true;
        if (edgeXRef.current || edgeYRef.current) {
          setEdges(null, null, 0, 0);
        }
      }

      if (isDraggingRef.current) {
        const sensitivityX = (MAX_YAW * 2) / (window.innerWidth * 1.2);
        yawRef.current = THREE.MathUtils.clamp(
          yawRef.current + dx * sensitivityX,
          -MAX_YAW,
          MAX_YAW
        );

        if (view === "home") {
          const sensitivityY = (MAX_PITCH * 2) / (window.innerHeight * 1.2);
          pitchRef.current = THREE.MathUtils.clamp(
            pitchRef.current + dy * sensitivityY,
            -MAX_PITCH,
            MAX_PITCH
          );
        }
      }

      lastPointerPosRef.current = { x: event.clientX, y: event.clientY };
    }
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
    if (isDraggingRef.current) {
      setTimeout(() => {
        isDraggingRef.current = false;
      }, 60);
    }
  };

  const handlePointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") {
      setEdges(null, null, 0, 0);
    }
  };

  const atHome = view === "home";

  return (
    <div
      className={`studio-root ${atHome && edgeX ? `edge-${edgeX}` : ""} ${atHome && edgeY ? `edge-${edgeY}` : ""}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
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
          if (isDraggingRef.current) return;
          if (view !== "home") {
            setSelectedObject(null);
          } else {
            handleSetView("home");
          }
        }}
      >
        <color attach="background" args={["#b7ddff"]} />
        <fog attach="fog" args={["#b7ddff", 12, 40]} />

        {/* Ambient & Sky Bounce (calibrated for high shadow contrast) */}
        <ambientLight intensity={0.25} />
        <hemisphereLight args={["#dbeaff", "#45382b", 0.4]} />

        {/* Directional Sunlight through the Window */}
        <primitive object={sunTarget} />
        <directionalLight
          castShadow
          target={sunTarget}
          position={[3.8, 5.8, -21.5]}
          intensity={2.2}
          color="#fff4df"
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0003}
          shadow-camera-near={0.5}
          shadow-camera-far={25}
          shadow-camera-left={-4}
          shadow-camera-right={4}
          shadow-camera-top={4}
          shadow-camera-bottom={-4}
        />

        {/* Top-room Ceiling Lamp casting downward floor shadows */}
        <primitive object={ceilingLampTarget} />
        <directionalLight
          castShadow
          target={ceilingLampTarget}
          position={[1.75, 3.65, -28.7]}
          intensity={1.9}
          color="#fff5e8"
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0004}
          shadow-camera-near={0.1}
          shadow-camera-far={2.5}
          shadow-camera-left={-2.2}
          shadow-camera-right={2.2}
          shadow-camera-top={2.2}
          shadow-camera-bottom={-2.2}
        />

        {/* Soft Warm Indoor Room / Ceiling Fill */}
        <pointLight
          position={[1.75, 3.6, -28.7]}
          intensity={0.6}
          color="#fff4ea"
          distance={6}
          decay={2}
        />

        {/* Monitor Screen Glow onto the Desk & Keyboard */}
        <pointLight
          position={[1.75, 2.85, -28.3]}
          intensity={0.3}
          color="#7ec8ff"
          distance={1.6}
          decay={1}
        />

        {/* Soft Ambient Contact Shadows directly on top of the floor */}
        <ContactShadows
          position={[1.75, 2.462, -28.6]}
          opacity={0.8}
          scale={9}
          blur={2.0}
          far={3.0}
          color="#15171e"
        />

        <Suspense fallback={null}>
          <Room
            view={view}
            onZoom={(v) => handleSetView(v)}
            onObjectClick={(obj) => setSelectedObject(obj)}
            isLoaded={isLoaded}
            isDraggingRef={isDraggingRef}
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
      <Loader onLoaded={handleLoaded} />

      {isLoaded && (
        <nav className="studio-nav">
          {NAV_BUTTONS[view].map((btn, i) => (
            <button
              key={`${view}-${btn.label}`}
              type="button"
              className="studio-nav-btn"
              style={{ animationDelay: `${i * 0.07}s` }}
              onClick={() => {
                if (btn.action === "zoom") {
                  handleSetView(btn.viewId);
                } else {
                  setSelectedObject({
                    id: btn.objectId,
                    label: btn.objectLabel,
                    position: "right",
                  });
                }
              }}
            >
              <img className="nav-default" src={btn.defaultImg} alt={btn.label} />
              <img className="nav-hover" src={btn.hoverImg} alt={btn.label} />
            </button>
          ))}
        </nav>
      )}

      {!atHome && (
        <button
          type="button"
          className="studio-back"
          onClick={() => handleSetView("home")}
        >
          <img className="back-default" src="assets/Back_default.png" alt="Return Button" width={64} height={64} />
          <img className="back-hover" src="assets/Back_hover.png" alt="Return Button" width={64} height={64} />
        </button>
      )}

      {selectedObject && (
        <div
          className={`studio-popup popup-${selectedObject.position}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedObject(null);
            }
          }}
        >
          <div className="studio-popup-content">
            <button
              type="button"
              className="studio-popup-close-x"
              aria-label="Close"
              onClick={() => setSelectedObject(null)}
            >
              ✕
            </button>
            <div className="studio-popup-screen">
              <h1>{selectedObject.label}</h1>

              <div className="studio-popup-inner">
                {POPUP_COMPONENTS[selectedObject.id] ? (
                  (() => {
                    const Component = POPUP_COMPONENTS[selectedObject.id];
                    return <Component />;
                  })()
                ) : (
                  <p>Content coming soon.</p>
                )}
              </div>

              <button type="button" onClick={() => setSelectedObject(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
