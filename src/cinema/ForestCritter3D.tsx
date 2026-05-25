import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { Group } from "three";
import type { CinemaStage } from "./cinemaTypes";

type Targets = {
  px: number;
  py: number;
  pz: number;
  ry: number;
  rz: number;
  armR: number;
  armL: number;
  scaleY: number;
};

function getTargets(stage: CinemaStage, slot: number): Targets {
  const i = slot;
  const spread = 0.95;
  const baseZ = -0.22 - i * 0.07;
  switch (stage) {
    case "intro":
      return {
        px: 5.15 + i * 0.44,
        py: 0,
        pz: baseZ,
        ry: -1.22,
        rz: 0,
        armR: 0,
        armL: 0.08,
        scaleY: 1,
      };
    case "enter":
      return {
        px: 1.02 + i * spread,
        py: 0,
        pz: baseZ,
        ry: -0.55,
        rz: 0,
        armR: 0.12,
        armL: 0.18,
        scaleY: 1,
      };
    case "pull":
      return {
        px: 0.55 + i * 0.9,
        py: 0.05,
        pz: baseZ + 0.1,
        ry: -0.4,
        rz: -0.32,
        armR: 1.15,
        armL: 0.58,
        scaleY: 1,
      };
    case "sit":
    case "lightsOff":
    case "projector":
    case "movie":
      return {
        px: 0.44 + i * 0.88,
        py: -0.5,
        pz: baseZ,
        ry: -0.26,
        rz: 0.1,
        armR: 0.38,
        armL: 0.2,
        scaleY: 0.83,
      };
    default:
      return getTargets("intro", slot);
  }
}

const COLORS = ["#38bdf8", "#22d3ee", "#0ea5e9"] as const;

function Mat({
  color,
  emissive = "#0369a1",
  emissiveIntensity = 0.08,
}: {
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
}) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={0.4}
      metalness={0.06}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
    />
  );
}

type Props = {
  stage: CinemaStage;
  slot: 0 | 1 | 2;
  delay: number;
};

export function ForestCritter3D({ stage, slot, delay }: Props) {
  const root = useRef<Group>(null);
  const head = useRef<Group>(null);
  const armR = useRef<Group>(null);
  const armL = useRef<Group>(null);
  const jaw = useRef<Group>(null);
  const color = COLORS[slot];

  const tmpV = useMemo(() => new THREE.Vector3(), []);
  const tmpE = useMemo(() => new THREE.Euler(0, 0, 0, "YXZ"), []);

  useFrame((state, dt) => {
    const g = root.current;
    const h = head.current;
    const ar = armR.current;
    const al = armL.current;
    const j = jaw.current;
    if (!g || !h || !ar || !al || !j) return;

    const t = getTargets(stage, slot);
    const speed = 2.6 + delay * 3.2;
    const a = 1 - Math.exp(-speed * dt);

    tmpV.set(t.px, t.py, t.pz);
    g.position.lerp(tmpV, a);

    tmpE.set(g.rotation.x, g.rotation.y, g.rotation.z);
    const ty = THREE.MathUtils.lerp(tmpE.y, t.ry, a);
    const tz = THREE.MathUtils.lerp(tmpE.z, t.rz, a);
    g.rotation.set(0, ty, tz);

    const sy = THREE.MathUtils.lerp(g.scale.y, t.scaleY, a);
    g.scale.set(1, sy, 1);

    ar.rotation.z = THREE.MathUtils.lerp(ar.rotation.z, t.armR, a);
    al.rotation.z = THREE.MathUtils.lerp(al.rotation.z, -t.armL, a);

    if (stage === "movie") {
      const bob = Math.sin(state.clock.elapsedTime * 2.15 + slot * 1.7) * 0.028;
      h.position.y = THREE.MathUtils.lerp(h.position.y, 0.58 + bob, 0.12);
      const jawOpen = Math.sin(state.clock.elapsedTime * 6 + slot) * 0.045 + 0.025;
      j.rotation.x = THREE.MathUtils.lerp(j.rotation.x, jawOpen, 0.18);
    } else if (stage === "pull") {
      h.position.y = THREE.MathUtils.lerp(
        h.position.y,
        0.58 + Math.sin(state.clock.elapsedTime * 10) * 0.012,
        0.15
      );
      j.rotation.x = THREE.MathUtils.lerp(j.rotation.x, 0.06, 0.12);
    } else {
      h.position.y = THREE.MathUtils.lerp(h.position.y, 0.58, a * 0.35);
      j.rotation.x = THREE.MathUtils.lerp(j.rotation.x, 0, a * 0.35);
    }
  });

  return (
    <group ref={root} castShadow>
      <mesh position={[0, 0.38, 0]} castShadow>
        <capsuleGeometry args={[0.34, 0.52, 10, 20]} />
        <Mat color={color} emissiveIntensity={0.1} />
      </mesh>

      <group ref={head} position={[0, 0.82, 0.02]}>
        <mesh castShadow>
          <sphereGeometry args={[0.34, 24, 24]} />
          <Mat color={color} emissive="#0c4a6e" emissiveIntensity={0.06} />
        </mesh>

        {slot === 0 && (
          <mesh position={[0, 0.42, 0]} castShadow>
            <coneGeometry args={[0.32, 0.52, 20]} />
            <Mat color="#bae6fd" emissive="#0284c7" emissiveIntensity={0.05} />
          </mesh>
        )}
        {slot === 1 && (
          <mesh position={[0, 0.38, 0]} scale={[1.05, 0.55, 1.05]} castShadow>
            <sphereGeometry args={[0.36, 20, 16]} />
            <Mat color="#7dd3fc" emissiveIntensity={0.07} />
          </mesh>
        )}
        {slot === 2 && (
          <mesh position={[0, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.36, 0.3, 0.2, 28]} />
            <Mat color="#67e8f9" emissive="#0e7490" emissiveIntensity={0.06} />
          </mesh>
        )}

        <mesh position={[-0.12, 0.06, 0.28]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshBasicMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[0.12, 0.06, 0.28]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshBasicMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[-0.12, 0.06, 0.31]}>
          <sphereGeometry args={[0.038, 10, 10]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0.12, 0.06, 0.31]}>
          <sphereGeometry args={[0.038, 10, 10]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>

        <group ref={jaw} position={[0, -0.12, 0.26]}>
          <mesh rotation={[0.25, 0, 0]}>
            <torusGeometry args={[0.1, 0.032, 8, 20, Math.PI]} />
            <Mat color={color} emissiveIntensity={0.04} />
          </mesh>
        </group>
      </group>

      <group ref={armL} position={[-0.42, 0.55, 0.04]} rotation={[0, 0, 0.35]}>
        <mesh position={[-0.16, 0, 0]} castShadow>
          <capsuleGeometry args={[0.07, 0.22, 6, 12]} />
          <Mat color={color} />
        </mesh>
        <mesh position={[-0.32, 0, 0.02]} castShadow>
          <sphereGeometry args={[0.1, 14, 14]} />
          <Mat color="#7dd3fc" emissiveIntensity={0.03} />
        </mesh>
      </group>

      <group ref={armR} position={[0.42, 0.55, 0.04]} rotation={[0, 0, -0.35]}>
        <mesh position={[0.16, 0, 0]} castShadow>
          <capsuleGeometry args={[0.07, 0.22, 6, 12]} />
          <Mat color={color} />
        </mesh>
        <mesh position={[0.32, 0, 0.02]} castShadow>
          <sphereGeometry args={[0.1, 14, 14]} />
          <Mat color="#7dd3fc" emissiveIntensity={0.03} />
        </mesh>
      </group>

      <mesh position={[0, 0.12, 0.26]} castShadow>
        <sphereGeometry args={[0.08, 12, 12]} />
        <Mat color="#0ea5e9" emissiveIntensity={0.02} />
      </mesh>
    </group>
  );
}
