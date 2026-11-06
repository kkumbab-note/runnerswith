/**
 * 제품 6종을 three.js 코드로 모델링해서 보여주는 3D 뷰어 (외부 3D 파일 없음).
 * 상세 모달에서 3D 탭을 열 때 동적으로 import돼요. 실제 GLB 파일이 생기면
 * MODELS의 build를 GLTFLoader로 바꾸면 돼요.
 */
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js"
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js"
import type { ProductId } from "@/lib/products"

const ACCENT = "#E5502F"
const TAU = Math.PI * 2
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
/** 슈퍼타원 단면 */
const se = (v: number, n: number) => Math.sign(v) * Math.abs(v) ** (2 / n)

type Vec3 = [number, number, number]
/** [x, y, z] 또는 [x, y, z, uvX, uvY] */
type SurfacePoint = [number, number, number] | [number, number, number, number, number]

/* ---------- 공통 도구 ---------- */
const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void) => {
  const c = document.createElement("canvas")
  c.width = w
  c.height = h
  draw(c.getContext("2d")!, w, h)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.anisotropy = 8
  return t
}

const grain = (g: CanvasRenderingContext2D, w: number, h: number, amount: number) => {
  const img = g.getImageData(0, 0, w, h)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 255 * amount
    d[i] += n
    d[i + 1] += n
    d[i + 2] += n
  }
  g.putImageData(img, 0, 0)
}

const drawMark = (g: CanvasRenderingContext2D, x: number, y: number, s: number, stroke: string, sy = 1) => {
  g.save()
  g.translate(x, y)
  g.scale(s, s * sy)
  g.translate(-24, -16)
  g.lineCap = "round"
  g.lineWidth = 3.4
  g.strokeStyle = stroke
  g.stroke(new Path2D("M45 3H17a13 13 0 0 0 0 26h28"))
  g.stroke(new Path2D("M45 9.6H17a6.4 6.4 0 0 0 0 12.8h28"))
  g.fillStyle = ACCENT
  g.beginPath()
  g.arc(17, 16, 3, 0, TAU)
  g.fill()
  g.restore()
}

interface LoftOptions {
  mask?: (t: number, u: number) => boolean
  weldU?: boolean
}

/** (t, u) 격자로 곡면을 만들어요 */
const loft = (nT: number, nU: number, fn: (t: number, u: number) => SurfacePoint, { mask, weldU = false }: LoftOptions = {}) => {
  const row = nU + 1
  const pos = new Float32Array((nT + 1) * row * 3)
  const uv = new Float32Array((nT + 1) * row * 2)
  let k = 0
  let q = 0
  for (let i = 0; i <= nT; i++) {
    for (let j = 0; j <= nU; j++) {
      const p = fn(i / nT, j / nU)
      pos[k++] = p[0]
      pos[k++] = p[1]
      pos[k++] = p[2]
      uv[q++] = p.length === 5 ? p[3] : i / nT
      uv[q++] = p.length === 5 ? p[4] : j / nU
    }
  }
  const idx: number[] = []
  for (let i = 0; i < nT; i++) {
    for (let j = 0; j < nU; j++) {
      if (mask?.((i + 0.5) / nT, (j + 0.5) / nU)) continue
      const a = i * row + j
      const b = a + row
      idx.push(a, b, a + 1, b, b + 1, a + 1)
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3))
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2))
  geo.setIndex(idx)
  geo.computeVertexNormals()
  if (weldU) {
    // 닫힌 단면의 이음매 노멀을 맞춰 줄무늬를 없애요
    const n = geo.attributes.normal as THREE.BufferAttribute
    for (let i = 0; i <= nT; i++) {
      const a = i * row
      const b = a + nU
      const x = n.getX(a) + n.getX(b)
      const y = n.getY(a) + n.getY(b)
      const z = n.getZ(a) + n.getZ(b)
      const l = Math.hypot(x, y, z) || 1
      n.setXYZ(a, x / l, y / l, z / l)
      n.setXYZ(b, x / l, y / l, z / l)
    }
  }
  return geo
}

const mesh = (geo: THREE.BufferGeometry, mat: THREE.Material) => {
  const m = new THREE.Mesh(geo, mat)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

const tube = (pts: Vec3[], r: number, mat: THREE.Material, closed = false, seg = 48) =>
  mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), closed), seg, r, 10, closed), mat)

const fabric = (o: THREE.MeshPhysicalMaterialParameters) =>
  new THREE.MeshPhysicalMaterial({ roughness: 0.88, metalness: 0, sheen: 0.7, sheenRoughness: 0.7, sheenColor: "#ffffff", side: THREE.DoubleSide, ...o })

const solid = (o: THREE.MeshStandardMaterialParameters) =>
  new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0, side: THREE.DoubleSide, ...o })

const reflective = () => new THREE.MeshStandardMaterial({ color: "#e3e5e8", metalness: 0.9, roughness: 0.2, emissive: "#2e2e2e" })

/** 몸통 곡면에 붙도록 박스를 휘어요 */
const bendZ = (geo: THREE.BufferGeometry, k: number) => {
  const p = geo.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < p.count; i++) p.setZ(i, p.getZ(i) + k * p.getX(i) ** 2)
  geo.computeVertexNormals()
  return geo
}

const blobTex = () =>
  canvasTex(256, 256, (g, w, h) => {
    const r = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
    r.addColorStop(0, "rgba(40,30,20,.55)")
    r.addColorStop(0.55, "rgba(40,30,20,.22)")
    r.addColorStop(1, "rgba(40,30,20,0)")
    g.fillStyle = r
    g.fillRect(0, 0, w, h)
  })

/* ---------- 텍스처 ---------- */
interface UpperStyle {
  base: string
  rib: string
  line: string
  markStroke: string
  mesh?: boolean
}

const upperTex = (o: UpperStyle) =>
  canvasTex(1024, 512, (g, w, h) => {
    g.fillStyle = o.base
    g.fillRect(0, 0, w, h)
    g.fillStyle = o.rib
    if (o.mesh) {
      for (let y = 3, r = 0; y < h; y += 6, r++) {
        for (let x = (r % 2) * 4; x < w; x += 8) {
          g.beginPath()
          g.ellipse(x, y, 2.3, 1.6, 0, 0, TAU)
          g.fill()
        }
      }
    } else {
      g.globalAlpha = 0.55
      for (let y = 0; y < h; y += 5) g.fillRect(0, y, w, 2)
      g.globalAlpha = 1
    }
    // 양쪽 측면의 두 줄 레인 라인
    g.strokeStyle = o.line
    g.lineWidth = 6
    g.lineCap = "round"
    for (const [u0, u1] of [
      [0.86, 0.72],
      [0.905, 0.765],
    ]) {
      for (const flip of [false, true]) {
        const a = flip ? 1 - u0 : u0
        const b = flip ? 1 - u1 : u1
        g.beginPath()
        g.moveTo(0.27 * w, (1 - a) * h)
        g.lineTo(0.63 * w, (1 - b) * h)
        g.stroke()
      }
    }
    drawMark(g, 0.1 * w, 0.2 * h, 1.4, o.markStroke, 0.62)
    grain(g, w, h, 0.05)
  })

const treadTex = (base: string, groove: string) => {
  const t = canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = base
    g.fillRect(0, 0, w, h)
    g.strokeStyle = groove
    g.lineWidth = 3
    for (let x = -h; x < w; x += 14) {
      g.beginPath()
      g.moveTo(x, 0)
      g.lineTo(x + h * 0.4, h / 2)
      g.lineTo(x, h)
      g.stroke()
    }
    grain(g, w, h, 0.06)
  })
  return t
}

const foamTex = () =>
  canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = "#ffffff"
    g.fillRect(0, 0, w, h)
    grain(g, w, h, 0.035)
  })

const perfTex = () =>
  canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = "#EFEAE0"
    g.fillRect(0, 0, w, h)
    g.fillStyle = "rgba(110, 98, 84, .22)"
    for (let y = 4, r = 0; y < h; y += 9, r++) {
      for (let x = (r % 2) * 5; x < w; x += 10) {
        g.beginPath()
        g.ellipse(x, y, 1.7, 2.7, 0, 0, TAU)
        g.fill()
      }
    }
    g.fillStyle = "rgba(22, 21, 19, .06)"
    g.fillRect(0, h - 24, w, 24)
    const u = (Math.PI / 2 - 0.36) / TAU
    g.fillStyle = ACCENT
    g.beginPath()
    g.ellipse(u * w, 0.2 * h, 9, 15, 0, 0, TAU)
    g.fill()
    grain(g, w, h, 0.03)
  })

const wovenTex = (base: string) =>
  canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = base
    g.fillRect(0, 0, w, h)
    g.strokeStyle = "rgba(255,255,255,.035)"
    g.lineWidth = 1
    for (let i = 0; i < w; i += 3) {
      g.beginPath()
      g.moveTo(i, 0)
      g.lineTo(i, h)
      g.stroke()
    }
    for (let i = 0; i < h; i += 4) {
      g.beginPath()
      g.moveTo(0, i)
      g.lineTo(w, i)
      g.stroke()
    }
    grain(g, w, h, 0.05)
  })

const ribTex = (base: string) =>
  canvasTex(512, 128, (g, w, h) => {
    g.fillStyle = base
    g.fillRect(0, 0, w, h)
    g.fillStyle = "rgba(0,0,0,.35)"
    for (let x = 0; x < w; x += 6) g.fillRect(x, 0, 2, h)
    grain(g, w, h, 0.05)
  })

const capTex = () =>
  canvasTex(2048, 512, (g, w, h) => {
    g.fillStyle = "#23211F"
    g.fillRect(0, 0, w, h)
    g.fillStyle = "rgba(0,0,0,.7)"
    for (const [a, b] of [
      [0.02, 0.15],
      [0.35, 0.48],
    ]) {
      for (let y = h * 0.34, r = 0; y < h * 0.9; y += 17, r++) {
        for (let x = a * w + (r % 2) * 9; x < b * w; x += 18) {
          g.beginPath()
          g.arc(x, y, 4.2, 0, TAU)
          g.fill()
        }
      }
    }
    g.strokeStyle = "rgba(0,0,0,.6)"
    g.lineWidth = 4
    for (let k = 1; k <= 6; k++) {
      const x = (k / 6) * w
      g.beginPath()
      g.moveTo(x, 0)
      g.lineTo(x, h)
      g.stroke()
    }
    drawMark(g, 0.25 * w, 0.6 * h, 2.4, "#d9dce0", 1.3)
    g.fillStyle = "rgba(0,0,0,.25)"
    g.fillRect(0, h - 18, w, 18)
    grain(g, w, h, 0.04)
  })

/* ---------- 러닝화 ---------- */
interface ShoeStyle {
  heel: number
  fore: number
  spring: number
  collar: number
  instep: number
  sheen: number
  upper: UpperStyle
  mid: string
  outsole: [string, string]
  outFore?: string
  lace: string
}

const DAILY: ShoeStyle = {
  heel: 0.4,
  fore: 0.29,
  spring: 0.24,
  collar: 0.58,
  instep: 0.82,
  sheen: 0.35,
  upper: { base: "#D3C4AA", rib: "#B9A688", line: "#EDE3D2", markStroke: "#A5937A" },
  mid: "#E8DCC6",
  outsole: ["#CDBEA4", "#B3A285"],
  lace: "#EFE7DA",
}

const TEMPO: ShoeStyle = {
  heel: 0.48,
  fore: 0.36,
  spring: 0.32,
  collar: 0.52,
  instep: 0.74,
  sheen: 0.12,
  upper: { base: "#121110", rib: "#2E2C2A", line: "#77736D", markStroke: "#8A867F", mesh: true },
  mid: "#F1EDE6",
  outsole: ["#151413", "#33312E"],
  outFore: ACCENT,
  lace: "#121110",
}

const buildShoe = (o: ShoeStyle) => {
  const g = new THREE.Group()
  const L = 3
  const X = (t: number) => (t - 0.5) * L
  const heelR = (t: number) => (t < 0.14 ? Math.sqrt(clamp01(1 - ((0.14 - t) / 0.14) ** 2)) : 1)
  const toeR = (t: number) => (t > 0.84 ? Math.sqrt(clamp01(1 - ((t - 0.84) / 0.16) ** 2)) : 1)
  const halfW = (t: number) => (0.35 + 0.13 * smooth(0.36, 0.74, t) - 0.035 * Math.exp(-(((t - 0.46) / 0.12) ** 2))) * heelR(t) * toeR(t)
  const H = (t: number) => o.heel * (1 - t) + o.fore * t
  const lift = (t: number) => o.spring * smooth(0.66, 1, t) ** 2 + 0.06 * smooth(0.16, 0, t) ** 2

  // 미드솔
  g.add(
    mesh(
      loft(
        140,
        56,
        (t, u) => {
          const a = halfW(t) * 1.07
          const b = (H(t) / 2) * (0.86 + 0.14 * toeR(t))
          const yc = lift(t) + b
          const th = u * TAU
          return [X(t), yc + b * se(Math.sin(th), 3.6), a * se(Math.cos(th), 3.6)]
        },
        { weldU: true },
      ),
      solid({ color: o.mid, map: foamTex(), roughness: 0.55 }),
    ),
  )

  // 아웃솔
  const outsole = (t0: number, t1: number, color: string) => {
    const tex = treadTex(color, o.outsole[1])
    return mesh(
      loft(
        80,
        40,
        (s, u) => {
          const t = t0 + s * (t1 - t0)
          const a = halfW(t) * 1.05
          const th = u * TAU
          return [X(t), lift(t) + 0.03 + 0.045 * se(Math.sin(th), 3), a * se(Math.cos(th), 3), s * 4, u]
        },
        { weldU: true },
      ),
      solid({ map: tex, roughness: 0.8 }),
    )
  }
  if (o.outFore) g.add(outsole(0, 0.46, o.outsole[0]), outsole(0.5, 1, o.outFore))
  else g.add(outsole(0, 1, o.outsole[0]))

  // 갑피 (발목 구멍은 비워 둬요)
  const UH = (t: number) => (o.collar + (o.instep - o.collar) * smooth(0.22, 0.52, t)) * (1 - 0.55 * smooth(0.6, 0.98, t)) * toeR(t)
  const base = (t: number) => lift(t) + H(t) * 0.8
  const upperP = (t: number, u: number): Vec3 => {
    const th = Math.PI * (1 - u)
    const w = halfW(t) * 0.97
    return [X(t), base(t) + UH(t) * Math.abs(Math.sin(th)) ** (2 / 2.4), w * se(Math.cos(th), 2.4)]
  }
  const C = { t: 0.215, u: 0.5, rt: 0.165, ru: 0.235 }
  const upperMat = fabric({ map: upperTex(o.upper), roughness: 0.92, sheen: o.sheen })
  g.add(mesh(loft(150, 72, upperP, { mask: (t, u) => ((t - C.t) / C.rt) ** 2 + ((u - C.u) / C.ru) ** 2 < 1 }), upperMat))

  // 패딩 칼라
  const ring: Vec3[] = []
  for (let k = 0; k < 72; k++) {
    const a = (k / 72) * TAU
    const p = upperP(C.t + C.rt * Math.cos(a), C.u + C.ru * Math.sin(a))
    ring.push([p[0], p[1] + 0.004, p[2] * 1.01])
  }
  g.add(tube(ring, 0.046, upperMat, true, 144))

  // 텅
  g.add(
    mesh(
      loft(20, 20, (s, v) => {
        const p = upperP(0.335 + s * 0.12, 0.38 + v * 0.24)
        return [p[0] - 0.02 * (1 - s), p[1] + 0.012 + 0.07 * (1 - s) ** 1.5, p[2] * 0.96]
      }),
      upperMat,
    ),
  )

  // 끈
  const laceMat = fabric({ color: o.lace, roughness: 0.8, sheen: o.sheen })
  const eye = (t: number, u: number): Vec3 => {
    const p = upperP(t, u)
    return [p[0], p[1] + 0.02, p[2] * 1.03]
  }
  for (let k = 0; k < 5; k++) {
    const t0 = 0.42 + k * 0.055
    const t1 = t0 + 0.05
    for (const [ua, ub] of [
      [0.37, 0.63],
      [0.63, 0.37],
    ]) {
      const A = eye(t0, ua)
      const B = eye(t1, ub)
      g.add(tube([A, [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2 + 0.02, (A[2] + B[2]) / 2], B], 0.017, laceMat, false, 16))
    }
  }

  // 트랙 레드 힐 루프
  const top = upperP(0.012, 0.5)
  const loop = mesh(new THREE.TorusGeometry(0.075, 0.022, 10, 24, Math.PI), solid({ color: ACCENT, roughness: 0.55 }))
  loop.position.set(top[0] + 0.03, top[1] - 0.025, 0)
  loop.rotation.z = 0.35
  g.add(loop)
  return g
}

/* ---------- 싱글렛 (고스트 마네킹) ---------- */
const buildSinglet = () => {
  const g = new THREE.Group()
  const Ht = 1.9
  const rx = (h: number) => 0.64 - 0.05 * smooth(0, 0.35, h) + 0.06 * smooth(0.35, 0.7, h) - 0.11 * smooth(0.75, 1, h)
  const rz = (h: number) => (0.33 - 0.02 * smooth(0, 0.35, h) + 0.05 * smooth(0.35, 0.68, h)) * (1 - 0.88 * smooth(0.8, 1, h))
  // 각 세로줄의 윗선: 암홀·넥라인 모양
  const topH = (th: number) => {
    const c = Math.abs(Math.cos(th))
    const front = Math.sin(th) > 0
    if (c > 0.6) return 1 - 0.46 * Math.sin(((c - 0.6) / 0.4) * (Math.PI / 2)) ** 0.8
    if (c < 0.36) return 1 - (front ? 0.22 : 0.08) * Math.sqrt(clamp01(1 - (c / 0.36) ** 2))
    return 1
  }
  g.add(
    mesh(
      loft(
        90,
        220,
        (s, v) => {
          const th = v * TAU
          const h = s * topH(th)
          const wob = 1 + 0.012 * Math.sin(th * 7 + h * 10) * (1 - h)
          return [rx(h) * Math.cos(th) * wob, h * Ht, rz(h) * Math.sin(th) * wob, v, h]
        },
        { weldU: true },
      ),
      fabric({ map: perfTex(), roughness: 0.93, sheen: 0.6 }),
    ),
  )
  return g
}

/* ---------- 쇼츠 ---------- */
const buildShorts = () => {
  const g = new THREE.Group()
  const fab = fabric({ map: wovenTex("#1D1C1A"), roughness: 0.8, sheen: 0.15 })
  const JOIN = 0.5 // 가랑이 높이: 위는 한 통, 아래는 두 다리
  const hipRx = (h: number) => 0.7 - 0.07 * smooth(JOIN, 1, h)
  const hipRz = (h: number) => 0.46 - 0.06 * smooth(JOIN, 1, h)
  g.add(
    mesh(
      loft(
        40,
        180,
        (s, v) => {
          const h = JOIN + s * (0.92 - JOIN)
          const th = v * TAU
          return [hipRx(h) * Math.cos(th), h, hipRz(h) * Math.sin(th), v * 2, h * 1.5]
        },
        { weldU: true },
      ),
      fab,
    ),
  )
  g.add(
    mesh(
      loft(
        8,
        180,
        (s, v) => {
          const h = 0.9 + s * 0.1
          const th = v * TAU
          const k = 1.012
          return [hipRx(h) * k * Math.cos(th), h, hipRz(h) * k * Math.sin(th), v * 3, s]
        },
        { weldU: true },
      ),
      fabric({ map: ribTex("#1B1A18"), roughness: 0.9, sheen: 0.1 }),
    ),
  )

  // 다리: 가랑이에서는 엉덩이 단면의 반쪽(D자)과 맞물리고, 밑단으로 갈수록 둥근 통이 돼요
  const piping = solid({ color: ACCENT, roughness: 0.5 })
  for (const side of [1, -1]) {
    const ang = (v: number) => (v <= 0.75 ? -Math.PI / 2 + (v / 0.75) * Math.PI : Math.PI / 2 + ((v - 0.75) / 0.25) * Math.PI)
    const hemH = (v: number) => 0.075 * clamp01((Math.cos(ang(v)) - 0.84) / 0.16) ** 0.7
    const P = (v: number, h: number): Vec3 => {
      const b = ang(v)
      const m = smooth(JOIN, 0, h)
      const top = v <= 0.75 ? [hipRx(JOIN) * Math.cos(b), hipRz(JOIN) * Math.sin(b)] : [0.004, hipRz(JOIN) * Math.sin(b)]
      const flare = Math.max(0, Math.cos(b)) * 0.04 * m
      const hem = [0.37 + (0.34 + flare) * Math.cos(b), 0.44 * Math.sin(b)]
      return [side * (top[0] + (hem[0] - top[0]) * m), h, top[1] + (hem[1] - top[1]) * m]
    }
    g.add(
      mesh(
        loft(
          36,
          160,
          (s, v) => {
            const h0 = hemH(v)
            const h = h0 + s * (JOIN - h0)
            return [...P(v, h), v * 1.5, h * 1.5]
          },
          { weldU: true },
        ),
        fab,
      ),
    )
    const ring: Vec3[] = []
    for (let k = 0; k < 160; k++) {
      const v = k / 160
      const p = P(v, hemH(v))
      const cx = side * 0.37
      ring.push([cx + (p[0] - cx) * 1.012, p[1] + 0.004, p[2] * 1.012])
    }
    g.add(tube(ring, 0.011, piping, true, 320))
  }

  // 드로코드
  const cord = solid({ color: "#3A3835", roughness: 0.7 })
  const zf = hipRz(0.95) * 1.02
  for (const s of [1, -1]) {
    g.add(
      tube(
        [
          [s * 0.03, 0.95, zf],
          [s * 0.065, 0.86, zf + 0.03],
          [s * 0.05, 0.73, zf + 0.02],
        ],
        0.011,
        cord,
        false,
        24,
      ),
    )
  }
  // 뒤 지퍼 포켓
  const zb = -hipRz(0.84) - 0.01
  const pocket = mesh(bendZ(new RoundedBoxGeometry(0.44, 0.12, 0.016, 3, 0.006), 0.5), fabric({ color: "#151413", roughness: 0.8, sheen: 0.1 }))
  pocket.position.set(0, 0.84, zb)
  g.add(pocket)
  const zip = mesh(bendZ(new THREE.BoxGeometry(0.4, 0.008, 0.01, 12, 1, 1), 0.5), solid({ color: "#0E0D0C" }))
  zip.position.set(0, 0.875, zb - 0.01)
  g.add(zip)
  const pull = mesh(new RoundedBoxGeometry(0.03, 0.06, 0.012, 2, 0.004), solid({ color: ACCENT }))
  pull.position.set(0.19, 0.845, zb - 0.012 + 0.5 * 0.19 ** 2)
  g.add(pull)
  return g
}

/* ---------- 러닝벨트 ---------- */
const buildBelt = () => {
  const g = new THREE.Group()
  const RX = 1.0
  const RZ = 0.68
  const Y = 0.3
  const BW = 0.26
  g.add(
    mesh(
      loft(
        12,
        240,
        (s, v) => {
          const th = v * TAU
          return [RX * Math.cos(th), Y + (s - 0.5) * BW, RZ * Math.sin(th), v * 8, s]
        },
        { weldU: true },
      ),
      fabric({ map: ribTex("#191817"), roughness: 0.85, sheen: 0.12 }),
    ),
  )
  g.add(
    mesh(
      loft(
        1,
        240,
        (s, v) => {
          const th = v * TAU
          const k = 1.004
          return [RX * k * Math.cos(th), Y - 0.035 + s * 0.022, RZ * k * Math.sin(th)]
        },
        { weldU: true },
      ),
      reflective(),
    ),
  )

  // 앞 포켓: 벨트 곡률(앞쪽 곡률반경 RX²/RZ)에 맞춰 휘어요
  const R = (RX * RX) / RZ
  const zc = RZ + 0.065
  const wrap = (geo: THREE.BufferGeometry) => {
    const p = geo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < p.count; i++) {
      const a = p.getX(i) / R
      const rr = R + p.getZ(i)
      p.setXYZ(i, rr * Math.sin(a), p.getY(i) + Y, rr * Math.cos(a) - R + zc)
    }
    geo.computeVertexNormals()
    return geo
  }
  g.add(mesh(wrap(new RoundedBoxGeometry(0.96, 0.32, 0.13, 6, 0.055)), fabric({ map: wovenTex("#151413"), roughness: 0.8, sheen: 0.12 })))
  g.add(mesh(wrap(new THREE.BoxGeometry(0.88, 0.018, 0.006, 24, 1, 1).translate(0, -0.06, 0.066)), reflective()))
  g.add(mesh(wrap(new THREE.BoxGeometry(0.84, 0.01, 0.008, 24, 1, 1).translate(0, 0.11, 0.066)), solid({ color: "#0E0D0C" })))
  g.add(mesh(wrap(new THREE.BoxGeometry(0.035, 0.085, 0.014).translate(0.41, 0.06, 0.075)), solid({ color: ACCENT })))
  const buckle = mesh(new RoundedBoxGeometry(0.18, 0.2, 0.05, 3, 0.02), solid({ color: "#3A3835", roughness: 0.4 }))
  buckle.position.set(0, Y, -RZ - 0.02)
  g.add(buckle)
  return g
}

/* ---------- 러닝 캡 ---------- */
const buildCap = () => {
  const g = new THREE.Group()
  const r = 0.62
  const sz = 1.1
  const fab = fabric({ map: capTex(), roughness: 0.86, sheen: 0.15 })
  const crown = mesh(new THREE.SphereGeometry(r, 96, 40, 0, TAU, 0, Math.PI / 2), fab)
  crown.scale.set(1, 0.86, sz)
  g.add(crown)
  const button = mesh(new THREE.SphereGeometry(0.035, 16, 12), fab)
  button.position.y = r * 0.86
  g.add(button)

  // 짧은 소프트 챙: 앞쪽 ±1.2rad, 옆으로 갈수록 좁아지고 아래로 휘어요
  const P = (a: number, s: number): Vec3 => {
    const phi = (a - 0.5) * 2 * 1.2
    const A = (a - 0.5) * 2
    const len = 0.4 * Math.max(0, Math.cos(phi * 1.18)) ** 1.1
    const d = s * len
    const k = 0.985
    const y = 0.006 - 0.11 * s ** 1.5 - 0.1 * A * A * s ** 1.2
    return [r * k * Math.sin(phi) + Math.sin(phi) * d, y, r * sz * k * Math.cos(phi) + Math.cos(phi) * d]
  }
  g.add(mesh(loft(64, 20, P), fabric({ color: "#161514", roughness: 0.85, sheen: 0.1 })))
  const edge: Vec3[] = []
  for (let k = 0; k <= 64; k++) edge.push(P(0.04 + (k / 64) * 0.92, 1))
  g.add(tube(edge, 0.013, reflective(), false, 128))
  const tab = mesh(new RoundedBoxGeometry(0.13, 0.06, 0.02, 2, 0.008), solid({ color: ACCENT }))
  tab.position.set(0, 0.07, -r * sz - 0.004)
  g.add(tab)
  return g
}

interface ModelSpec {
  /** 처음 카메라 방향 */
  view: Vec3
  /** 화면 채움 정도 (클수록 멀리) */
  fit: number
  /** 바닥 그림자 농도 */
  blob: number
  build: () => THREE.Group
}

const MODELS: Record<ProductId, ModelSpec> = {
  "daily-01": { view: [0.62, 0.36, 1], fit: 0.86, blob: 1, build: () => buildShoe(DAILY) },
  "tempo-02": { view: [0.62, 0.36, 1], fit: 0.86, blob: 1, build: () => buildShoe(TEMPO) },
  "breeze-03": { view: [0.32, 0.12, 1], fit: 1.02, blob: 0.8, build: buildSinglet },
  "lane-04": { view: [0.32, 0.2, 1], fit: 0.94, blob: 0.8, build: buildShorts },
  "pace-05": { view: [0.45, 0.6, 1], fit: 0.86, blob: 0, build: buildBelt },
  "night-06": { view: [0.8, 0.45, 1], fit: 0.92, blob: 1, build: buildCap },
}

const disposeObject = (obj: THREE.Object3D) => {
  obj.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return
    o.geometry.dispose()
    const mats: THREE.Material[] = Array.isArray(o.material) ? o.material : [o.material]
    for (const m of mats) {
      for (const v of Object.values(m)) if (v instanceof THREE.Texture) v.dispose()
      m.dispose()
    }
  })
}

export interface Viewer {
  setSpin(on: boolean): void
  rotate(rad: number): void
  zoom(factor: number): void
  reset(): void
  dispose(): void
}

/** host 안에 캔버스를 만들고 제품 모델을 띄워요. WebGL을 못 쓰면 Error("webgl")를 던져요 */
export function createViewer(host: HTMLElement, productId: ProductId, { spin }: { spin: boolean }): Viewer {
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  } catch {
    throw new Error("webgl")
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.92
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.setClearColor(0x000000, 0)
  renderer.domElement.style.display = "block"
  renderer.domElement.style.width = "100%"
  renderer.domElement.style.height = "100%"
  host.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environmentIntensity = 0.55
  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 80)
  const key = new THREE.DirectionalLight("#fff4e6", 2.0)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  key.shadow.radius = 4
  key.shadow.bias = -0.0004
  key.shadow.normalBias = 0.02
  scene.add(key, key.target, new THREE.HemisphereLight("#fffaf2", "#cbbfae", 0.55))
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.08 }))
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.enablePan = false
  controls.rotateSpeed = 0.8
  controls.zoomSpeed = 0.8
  controls.minPolarAngle = 0.2
  controls.maxPolarAngle = Math.PI / 2 - 0.05
  controls.autoRotateSpeed = 1.4
  controls.autoRotate = spin

  const resize = () => {
    const w = host.clientWidth || 1
    const h = host.clientHeight || 1
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(host)

  // 모델을 바닥 가운데에 놓고 바닥 그림자를 깔아요
  const spec = MODELS[productId]
  const group = spec.build()
  const box = new THREE.Box3().setFromObject(group)
  const c = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3())
  group.position.set(-c.x, -box.min.y + 0.002, -c.z)
  const model = new THREE.Group()
  model.add(group)
  if (spec.blob) {
    const blob = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: blobTex(), transparent: true, depthWrite: false, opacity: spec.blob }),
    )
    blob.rotation.x = -Math.PI / 2
    blob.position.y = 0.003
    blob.scale.set(size.x * 1.3, size.z * 1.4, 1)
    model.add(blob)
  }
  scene.add(model)

  // 카메라가 모델을 화면에 맞게 담도록 거리를 정해요
  const fitBox = new THREE.Box3().setFromObject(model)
  const center = fitBox.getCenter(new THREE.Vector3())
  const radius = fitBox.getSize(new THREE.Vector3()).length() / 2
  const vfov = THREE.MathUtils.degToRad(camera.fov)
  const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect)
  const dist = (radius / Math.sin(Math.min(vfov, hfov) / 2)) * spec.fit
  const home = { pos: center.clone().addScaledVector(new THREE.Vector3(...spec.view).normalize(), dist), target: center.clone() }
  camera.position.copy(home.pos)
  camera.near = dist / 60
  camera.far = dist * 12
  camera.updateProjectionMatrix()
  controls.target.copy(center)
  controls.minDistance = dist * 0.42
  controls.maxDistance = dist * 1.7
  controls.update()
  const s = radius * 1.6
  const sc = key.shadow.camera
  sc.left = -s
  sc.right = s
  sc.top = s
  sc.bottom = -s
  sc.near = 0.1
  sc.far = radius * 14
  sc.updateProjectionMatrix()
  key.position.set(center.x + radius * 2.2, radius * 4.2, center.z + radius * 2.8)
  key.target.position.copy(center)

  let raf = 0
  const loop = () => {
    raf = requestAnimationFrame(loop)
    controls.update()
    renderer.render(scene, camera)
  }
  loop()

  return {
    setSpin(on) {
      controls.autoRotate = on
    },
    rotate(rad) {
      model.rotation.y += rad
    },
    zoom(factor) {
      const off = camera.position.clone().sub(controls.target)
      const len = Math.min(controls.maxDistance, Math.max(controls.minDistance, off.length() * factor))
      camera.position.copy(controls.target).addScaledVector(off.normalize(), len)
    },
    reset() {
      camera.position.copy(home.pos)
      controls.target.copy(home.target)
      model.rotation.y = 0
      controls.update()
    },
    dispose() {
      cancelAnimationFrame(raf)
      ro.disconnect()
      controls.dispose()
      disposeObject(scene)
      pmrem.dispose()
      scene.environment?.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
