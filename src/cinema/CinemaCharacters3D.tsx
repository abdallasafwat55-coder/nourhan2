import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { Suspense } from "react";
import { ForestCritter3D } from "./ForestCritter3D";
import type { CinemaStage } from "./cinemaTypes";

type Props = {
  stage: CinemaStage;
};

export function CinemaCharacters3D({ stage }: Props) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[38]" aria-hidden>
      <Canvas
        shadows
        camera={{ position: [0.15, 1.22, 5.4], fov: 36, near: 0.1, far: 80 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
        onCreated={({ gl, scene }) => {
          scene.background = null;
          gl.setClearColor(0x000000, 0);
        }}
      >
        <ambientLight intensity={0.48} />
        <directionalLight
          castShadow
          position={[4.5, 9, 5]}
          intensity={1.45}
          shadow-mapSize={[1536, 1536]}
          shadow-camera-far={22}
          shadow-camera-near={0.5}
          shadow-camera-left={-7}
          shadow-camera-right={7}
          shadow-camera-top={7}
          shadow-camera-bottom={-7}
        />
        <directionalLight position={[-4, 5, 2]} intensity={0.38} color="#93c5fd" />
        <hemisphereLight color="#bae6fd" groundColor="#0f172a" intensity={0.35} />

        <Suspense fallback={null}>
          <group position={[0.35, -0.12, 0]}>
            <ForestCritter3D stage={stage} slot={0} delay={0} />
            <ForestCritter3D stage={stage} slot={1} delay={0.28} />
            <ForestCritter3D stage={stage} slot={2} delay={0.52} />
          </group>
          <ContactShadows position={[0, -0.02, 0]} opacity={0.42} scale={14} blur={2.2} far={8} />
        </Suspense>
      </Canvas>
    </div>
  );
}
