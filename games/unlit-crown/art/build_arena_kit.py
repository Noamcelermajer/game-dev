"""Builds the arena prop kit in Blender: columns, braziers, urns, skeletons, candles, banners.

Run headless:   blender --background --python art/build_arena_kit.py
Or live inside Blender (it replaces the current scene's objects).

Outputs: art/arena_kit.blend (editable source, not committed) and assets/arena_kit.glb.

Each prop is one object, built around its own origin (base centre, Z up, front = -Y) and
laid out in a row for viewing. The game looks props up by object name and re-materials
them by material name, so colours here are only for the Blender viewport.
"""
import math
import os
import random
from contextlib import nullcontext

import bmesh
import bpy
from mathutils import Matrix, Vector

ROOT = globals().get("UNLIT_ROOT") or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BLEND_PATH = os.path.join(ROOT, "art", "arena_kit.blend")
GLB_PATH = os.path.join(ROOT, "assets", "arena_kit.glb")
rng = random.Random(11)


def override():
    for win in bpy.context.window_manager.windows:
        for area in win.screen.areas:
            if area.type == "VIEW_3D":
                region = next(r for r in area.regions if r.type == "WINDOW")
                return bpy.context.temp_override(window=win, area=area, region=region)
    return nullcontext()


with override():
    if bpy.context.object and bpy.context.object.mode != "OBJECT":
        bpy.ops.object.mode_set(mode="OBJECT")
for ob in list(bpy.data.objects):
    bpy.data.objects.remove(ob, do_unlink=True)
for coll in (bpy.data.meshes, bpy.data.armatures, bpy.data.materials, bpy.data.actions, bpy.data.cameras, bpy.data.lights):
    for item in list(coll):
        if item.users == 0:
            coll.remove(item)
COL = bpy.context.scene.collection


def srgb(hexstr):
    r, g, b = (int(hexstr[i:i + 2], 16) / 255 for i in (1, 3, 5))
    lin = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (lin(r), lin(g), lin(b), 1.0)


def material(name, hexcol, glow=0.0):
    m = bpy.data.materials.new(name)
    try:
        m.use_nodes = True
    except Exception:
        pass
    nt = m.node_tree
    bsdf = next((n for n in nt.nodes if n.type == "BSDF_PRINCIPLED"), None)
    if bsdf is None:
        out = nt.nodes.new("ShaderNodeOutputMaterial")
        bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
        nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    col = srgb(hexcol)
    bsdf.inputs["Base Color"].default_value = col
    bsdf.inputs["Roughness"].default_value = 1.0
    if glow:
        bsdf.inputs["Emission Color"].default_value = col
        bsdf.inputs["Emission Strength"].default_value = glow
    m.diffuse_color = col
    return m


M = {
    "stone": material("stone", "#6c6478"),
    "iron": material("iron", "#2c2622"),
    "iron_thin": material("iron_thin", "#2c2622"),
    "bone": material("bone", "#d8d2c0"),
    "wax": material("wax", "#e8dcc0"),
    "clay": material("clay", "#7a4a2c"),
    "dark": material("dark", "#120c10"),
    "wood": material("wood", "#3a2a22"),
    "cloth": material("cloth", "#8e1a30"),
    "cloth_dark": material("cloth_dark", "#561224"),
    "gold": material("gold", "#c9963a"),
    "glow_flame": material("glow_flame", "#ffc860", glow=4.0),
    "glow_coal": material("glow_coal", "#ff5a10", glow=3.0),
}


class Prop:
    """One object made of several lofted shapes, each with its own material."""

    def __init__(self, name):
        self.name = name
        self.bm = bmesh.new()
        self.mats = []

    def _slot(self, mat):
        if mat not in self.mats:
            self.mats.append(mat)
        return self.mats.index(mat)

    def loft(self, rings, mat, n=4, xf=None, jag=0.0):
        """rings: (cx, cy, z, half_width, half_depth). jag: random height on the last ring's corners."""
        slot = self._slot(mat)
        loops = []
        for ri, (cx, cy, z, hw, hd) in enumerate(rings):
            vs = []
            for k in range(n):
                if n == 4:
                    a = math.pi / 4 + k * math.pi / 2
                    x = cx + hw * math.copysign(1, math.cos(a))
                    y = cy + hd * math.copysign(1, math.sin(a))
                else:
                    a = 2 * math.pi * k / n + math.pi / n
                    x = cx + hw * math.cos(a)
                    y = cy + hd * math.sin(a)
                zz = z + (rng.uniform(-jag, jag) if jag and ri == len(rings) - 1 else 0)
                v = Vector((x, y, zz))
                vs.append(self.bm.verts.new(xf @ v if xf else v))
            loops.append(vs)
        faces = []
        for a, b in zip(loops, loops[1:]):
            for k in range(n):
                faces.append(self.bm.faces.new((a[k], a[(k + 1) % n], b[(k + 1) % n], b[k])))
        faces.append(self.bm.faces.new(list(reversed(loops[0]))))
        faces.append(self.bm.faces.new(loops[-1]))
        for f in faces:
            f.material_index = slot
        return self

    def box(self, center, size, mat, xf=None):
        cx, cy, cz = center
        sx, sy, sz = size
        return self.loft([(cx, cy, cz - sz / 2, sx / 2, sy / 2), (cx, cy, cz + sz / 2, sx / 2, sy / 2)], mat, xf=xf)

    def rod(self, start, end, half, mat, n=4):
        d = Vector(end) - Vector(start)
        rot = Vector((0, 0, 1)).rotation_difference(d.normalized()).to_matrix().to_4x4()
        xf = Matrix.Translation(start) @ rot
        return self.loft([(0, 0, 0, half, half), (0, 0, d.length, half, half)], mat, n=n, xf=xf)

    def lathe(self, profile, mat, n=12, xf=None, jag=0.0):
        """profile: (z, radius) pairs from bottom to top."""
        return self.loft([(0, 0, z, r, r) for z, r in profile], mat, n=n, xf=xf, jag=jag)

    def build(self, x):
        bmesh.ops.recalc_face_normals(self.bm, faces=self.bm.faces[:])
        me = bpy.data.meshes.new(self.name)
        self.bm.to_mesh(me)
        self.bm.free()
        for m in self.mats:
            me.materials.append(M[m])
        ob = bpy.data.objects.new(self.name, me)
        ob.location = (x, 0, 0)
        COL.objects.link(ob)
        return ob


PROPS = []


def prop(name):
    p = Prop(name)
    PROPS.append(p)
    return p


# --- columns -------------------------------------------------------------------
BASE = [(0.35, 0.74), (0.43, 0.8), (0.52, 0.74), (0.58, 0.62), (0.64, 0.66), (0.72, 0.58)]
p = prop("pillar")
p.box((0, 0, 0.175), (1.7, 1.7, 0.35), "stone")
p.lathe(BASE + [(0.72, 0.56), (3.3, 0.55), (5.85, 0.5), (5.85, 0.57), (5.97, 0.57), (5.97, 0.5),
               (6.05, 0.52), (6.3, 0.8), (6.36, 0.82)], "stone")
p.box((0, 0, 6.51), (1.8, 1.8, 0.3), "stone")

p = prop("pillar_broken")
p.box((0, 0, 0.175), (1.7, 1.7, 0.35), "stone")
p.lathe(BASE + [(0.72, 0.56), (2.6, 0.55), (3.3, 0.54)], "stone", jag=0.45)

p = prop("drum")                                              # a fallen piece of column, on its side
lay = Matrix.Translation((0, 0, 0.53)) @ Matrix.Rotation(math.pi / 2, 4, "Y") @ Matrix.Translation((0, 0, -0.5))
p.lathe([(0.0, 0.53), (0.85, 0.53), (1.0, 0.5)], "stone", xf=lay, jag=0.14)

for i, s in enumerate((0.34, 0.26, 0.2)):                     # loose rubble
    p = prop(f"rubble_{'abc'[i]}")
    sides = 5 + i % 2
    p.loft([(0, 0, 0, s, s * 0.8), (0.03, 0.02, s * 0.5, s * 0.85, s * 0.7), (0.05, 0, s * 0.85, s * 0.45, s * 0.4)], "stone", n=sides, jag=s * 0.2)

# --- brazier: iron basket on three legs (origin: top of its stone stand) -------------
p = prop("brazier")
for k in range(3):
    a = 2 * math.pi * k / 3 + 0.5
    p.rod((math.cos(a) * 0.46, math.sin(a) * 0.46, 0), (math.cos(a) * 0.26, math.sin(a) * 0.26, 0.48), 0.045, "iron")
p.lathe([(0.4, 0.14), (0.47, 0.34), (0.58, 0.48), (0.7, 0.55), (0.76, 0.58)], "iron", n=10)
p.lathe([(0.75, 0.5), (0.79, 0.5)], "glow_coal", n=10)
for k in range(8):
    a = 2 * math.pi * k / 8
    p.rod((math.cos(a) * 0.56, math.sin(a) * 0.56, 0.72), (math.cos(a) * 0.64, math.sin(a) * 0.64, 1.1), 0.035, "iron_thin")
for k in range(10):                                           # top hoop, left open so the fire shows
    a = 2 * math.pi * k / 10
    xf = Matrix.Translation((math.cos(a) * 0.64, math.sin(a) * 0.64, 1.1)) @ Matrix.Rotation(a, 4, "Z")
    p.box((0, 0, 0), (0.07, 0.42, 0.07), "iron_thin", xf=xf)

# --- urns --------------------------------------------------------------------------
URN = [(0.0, 0.2), (0.06, 0.27), (0.3, 0.4), (0.5, 0.42), (0.68, 0.31), (0.77, 0.2), (0.85, 0.22), (0.9, 0.28), (0.93, 0.28)]
p = prop("urn")
p.lathe(URN, "clay", n=10)
p.lathe([(0.93, 0.2), (0.94, 0.2)], "dark", n=10)

p = prop("urn_broken")
p.lathe(URN[:4], "clay", n=10, jag=0.14)
p.lathe([(0.3, 0.3), (0.31, 0.3)], "dark", n=10)
p.loft([(0.55, 0.15, 0, 0.14, 0.09), (0.57, 0.15, 0.1, 0.1, 0.05)], "clay", n=5, jag=0.04)
p.loft([(0.5, -0.3, 0, 0.1, 0.12), (0.5, -0.28, 0.07, 0.06, 0.07)], "clay", n=5, jag=0.03)


# --- bones ---------------------------------------------------------------------------
def add_skull(p, xf):
    p.loft([(0, 0.02, 0.0, 0.1, 0.12), (0, 0.02, 0.07, 0.14, 0.16), (0, 0.02, 0.17, 0.145, 0.17),
            (0, 0.03, 0.25, 0.11, 0.13), (0, 0.04, 0.29, 0.05, 0.06)], "bone", n=8, xf=xf)
    p.box((0, -0.14, 0.06), (0.17, 0.1, 0.12), "bone", xf=xf)                 # jaw
    for sx in (-1, 1):
        p.box((sx * 0.055, -0.165, 0.15), (0.06, 0.04, 0.06), "dark", xf=xf)  # eye sockets
    p.box((0, -0.19, 0.08), (0.04, 0.02, 0.04), "dark", xf=xf)                # nose


p = prop("skull")
add_skull(p, Matrix.Identity(4))

p = prop("skeleton")                                          # lying on its back along +X, head at -X
B = 0.075                                                     # bone thickness: a little over one pixel
add_skull(p, Matrix.Translation((-0.72, 0, 0.0)) @ Matrix.Rotation(math.pi / 2, 4, "Z") @ Matrix.Rotation(-0.5, 4, "X"))
for i in range(7):
    p.box((-0.5 + i * 0.12, 0, 0.04), (0.08, 0.09, 0.07), "bone")              # spine
for i in range(5):
    x = -0.44 + i * 0.125
    p.box((x, 0, 0.13), (B * 0.8, 0.4, B * 0.7), "bone")                       # rib, over the top
    for sy in (-1, 1):
        p.box((x, sy * 0.2, 0.07), (B * 0.8, B * 0.8, 0.14), "bone")           # rib, down the side
p.box((0.36, 0, 0.05), (0.16, 0.32, 0.09), "bone")                             # pelvis
for sy, bend in ((-1, 0.25), (1, -0.5)):
    hip = Vector((0.42, sy * 0.13, 0.04))
    knee = hip + Vector((0.4, sy * 0.1, 0))
    foot = knee + Vector((0.38 * math.cos(bend), 0.38 * math.sin(bend) * sy * -1, 0))
    p.rod(hip, knee, B / 2, "bone")
    p.rod(knee, foot, B / 2 * 0.85, "bone")
for sy, reach in ((-1, 0.9), (1, -0.4)):
    shoulder = Vector((-0.46, sy * 0.22, 0.04))
    elbow = shoulder + Vector((0.1, sy * 0.3, 0))
    hand = elbow + Vector((0.3 * math.sin(reach), sy * 0.3 * math.cos(reach), 0))
    p.rod(shoulder, elbow, B / 2 * 0.85, "bone")
    p.rod(elbow, hand, B / 2 * 0.75, "bone")

p = prop("bone")
p.rod((-0.2, 0, 0.04), (0.2, 0, 0.04), 0.035, "bone")
for x in (-0.22, 0.22):
    p.box((x, 0, 0.04), (0.07, 0.11, 0.07), "bone")


# --- candles ---------------------------------------------------------------------------
def add_candle(p, x, y, h, r=0.07):
    p.lathe([(0.0, r * 1.7), (0.03, r * 1.5), (0.03, r), (h, r), (h, r * 0.4)], "wax", n=6, xf=Matrix.Translation((x, y, 0)))
    for k in range(2):                                        # wax drips down the side
        a = rng.uniform(0, 6.28)
        dl = rng.uniform(0.08, h * 0.6)
        p.box((x + math.cos(a) * r, y + math.sin(a) * r, h - dl / 2), (0.045, 0.045, dl), "wax")
    p.loft([(x, y, h + 0.02, 0.012, 0.012), (x, y, h + 0.08, 0.04, 0.04), (x, y, h + 0.2, 0.006, 0.006)], "glow_flame")


p = prop("candles_a")
for x, y, h in ((0, 0, 0.62), (0.2, -0.08, 0.38), (-0.18, -0.1, 0.48), (0.08, 0.18, 0.3), (-0.12, 0.16, 0.22)):
    add_candle(p, x, y, h)
p = prop("candles_b")
for x, y, h in ((0, 0, 0.42), (0.17, 0.05, 0.26), (-0.13, -0.09, 0.2)):
    add_candle(p, x, y, h)
p = prop("candle")
add_candle(p, 0, 0, 0.5, r=0.075)

# --- cloth -------------------------------------------------------------------------------
p = prop("banner")                                            # origin: centre of the pole; hangs down
p.box((0, 0, 0), (1.75, 0.08, 0.08), "wood")
for sx in (-1, 1):
    p.box((sx * 0.9, 0, 0), (0.1, 0.13, 0.13), "gold")
STRIPS = [2.3, 2.65, 2.2, 2.7, 2.4]
for i, length in enumerate(STRIPS):                           # folds: strips tilted alternately
    x = -0.52 + i * 0.26
    tilt = 0.28 if i % 2 else -0.28
    xf = Matrix.Translation((x, 0.02 if i % 2 else -0.02, 0)) @ Matrix.Rotation(tilt, 4, "Z")
    p.box((0, 0, -length / 2), (0.27, 0.04, length), "cloth" if i % 2 == 0 else "cloth_dark", xf=xf)
    p.loft([(0, 0, -length - 0.22, 0.01, 0.02), (0, 0, -length, 0.135, 0.02)], "cloth_dark", xf=xf)   # tattered point
p.box((0, -0.07, -1.02), (0.56, 0.03, 0.12), "gold")                                                 # crown emblem
for dx, hh in ((-0.22, 0.2), (0, 0.3), (0.22, 0.2)):
    p.box((dx, -0.07, -0.96 + hh / 2), (0.11, 0.03, hh), "gold")
    p.box((dx, -0.07, -0.9 + hh), (0.07, 0.03, 0.07), "gold")

p = prop("altar_cloth")                                       # origin: centre of the altar top
p.box((0, 0, 0.02), (1.05, 1.5, 0.04), "cloth")
p.box((0, -0.76, -0.45), (1.05, 0.04, 0.94), "cloth")
p.loft([(0, -0.76, -1.22, 0.02, 0.02), (0, -0.76, -0.92, 0.525, 0.02)], "cloth")
for sx in (-1, 1):
    p.box((sx * 0.5, -0.785, -0.45), (0.07, 0.02, 0.94), "gold")
p.box((0, -0.785, -0.4), (0.09, 0.02, 0.44), "gold")
p.box((0, -0.785, -0.3), (0.3, 0.02, 0.09), "gold")

# --- lay out, save, export ------------------------------------------------------------------
x = 0.0
for pr in PROPS:
    pr.build(x)
    x += 2.4

for win in bpy.context.window_manager.windows:
    for area in win.screen.areas:
        if area.type == "VIEW_3D":
            area.spaces[0].shading.type = "SOLID"
            area.spaces[0].shading.color_type = "MATERIAL"

os.makedirs(os.path.dirname(GLB_PATH), exist_ok=True)
with override():
    bpy.ops.wm.save_as_mainfile(filepath=BLEND_PATH)
    bpy.ops.export_scene.gltf(filepath=GLB_PATH, export_format="GLB", export_yup=True,
                              export_animations=False, export_cameras=False, export_lights=False)

tris = sum(len(poly.vertices) - 2 for ob in bpy.data.objects if ob.type == "MESH" for poly in ob.data.polygons)
print(f"KIT_BUILT props={len(PROPS)} tris={tris} glb={os.path.getsize(GLB_PATH)} bytes names={[pr.name for pr in PROPS]}")
