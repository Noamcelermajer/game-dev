"""Builds the Kindled hero in Blender: low-poly parts on a small rig, with Idle and Walk.

Run headless:   blender --background --python art/build_hero.py
Or live inside Blender (it replaces the current scene's objects).

Outputs: art/hero.blend (editable source) and assets/hero.glb (what the game loads).

Rules for game models (see docs/ART_DIRECTION.md): very low detail, exaggerated
proportions, flat colours only, glowing parts on a material named "glow*".
The hero faces -Y in Blender, which becomes +Z in the game.
"""
import math
import os
from contextlib import nullcontext

import bmesh
import bpy
from mathutils import Matrix, Quaternion, Vector

ROOT = globals().get("UNLIT_ROOT") or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BLEND_PATH = os.path.join(ROOT, "art", "hero.blend")
GLB_PATH = os.path.join(ROOT, "assets", "hero.glb")
FPS = 24


def override():
    """Operators need a 3D viewport when run inside a live Blender; none headless."""
    wm = bpy.context.window_manager
    for win in wm.windows:
        for area in win.screen.areas:
            if area.type == "VIEW_3D":
                region = next(r for r in area.regions if r.type == "WINDOW")
                return bpy.context.temp_override(window=win, area=area, region=region)
    return nullcontext()


# --- scene reset -----------------------------------------------------------
with override():
    if bpy.context.object and bpy.context.object.mode != "OBJECT":
        bpy.ops.object.mode_set(mode="OBJECT")
for ob in list(bpy.data.objects):
    bpy.data.objects.remove(ob, do_unlink=True)
for coll in (bpy.data.meshes, bpy.data.armatures, bpy.data.materials, bpy.data.actions, bpy.data.cameras, bpy.data.lights):
    for item in list(coll):
        if item.users == 0:
            coll.remove(item)
scene = bpy.context.scene
scene.render.fps = FPS
COL = scene.collection


# --- materials -------------------------------------------------------------
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
    bsdf.inputs["Metallic"].default_value = 0.0
    if glow:
        bsdf.inputs["Emission Color"].default_value = col
        bsdf.inputs["Emission Strength"].default_value = glow
    m.diffuse_color = col
    return m


M = {
    "cloak": material("cloak", "#9a1f2c"),
    "cloak_dark": material("cloak_dark", "#6e1622"),
    "hood": material("hood", "#b02a36"),
    "face": material("face", "#120c10"),
    "tunic": material("tunic", "#5a4a44"),
    "legs": material("legs", "#2a2428"),
    "boots": material("boots", "#1e1818"),
    "belt": material("belt", "#8a6a30"),
    "skin": material("skin", "#c89a78"),
    "metal": material("metal", "#1c1614"),
    "steel": material("steel", "#9a9aa8"),
    "scabbard": material("scabbard", "#3a2a22"),
    "glow_lantern": material("glow_lantern", "#ffb040", glow=4.0),
}


# --- geometry helpers --------------------------------------------------------
PARTS = []  # (object, bone name)


def loft(name, rings, mat, bone, n=4, xf=None):
    """Stack of rings (cx, cy, z, half_width, half_depth) joined into one closed shape."""
    bm = bmesh.new()
    loops = []
    for cx, cy, z, hw, hd in rings:
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
            v = Vector((x, y, z))
            vs.append(bm.verts.new(xf @ v if xf else v))
        loops.append(vs)
    for a, b in zip(loops, loops[1:]):
        for k in range(n):
            bm.faces.new((a[k], a[(k + 1) % n], b[(k + 1) % n], b[k]))
    bm.faces.new(list(reversed(loops[0])))
    bm.faces.new(loops[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    me.materials.append(M[mat])
    ob = bpy.data.objects.new(name, me)
    COL.objects.link(ob)
    PARTS.append((ob, bone))
    return ob


def box(name, center, size, mat, bone, xf=None):
    cx, cy, cz = center
    sx, sy, sz = size
    return loft(name, [(cx, cy, cz - sz / 2, sx / 2, sy / 2), (cx, cy, cz + sz / 2, sx / 2, sy / 2)], mat, bone, xf=xf)


def along(start, end):
    """Matrix placing local +Z along start->end, origin at start."""
    d = Vector(end) - Vector(start)
    rot = Vector((0, 0, 1)).rotation_difference(d.normalized()).to_matrix().to_4x4()
    return Matrix.Translation(start) @ rot, d.length


# --- the hero: 1.55 units tall, facing -Y --------------------------------------
for side, x in (("L", 0.13), ("R", -0.13)):
    loft(f"leg_{side}", [(x, 0, 0.12, 0.085, 0.09), (x, 0, 0.54, 0.105, 0.11)], "legs", f"leg_{side}")
    loft(f"boot_{side}", [(x, -0.03, 0.0, 0.1, 0.145), (x, -0.02, 0.17, 0.095, 0.12)], "boots", f"leg_{side}")

loft("tunic_skirt", [(0, 0, 0.4, 0.26, 0.16), (0, 0, 0.62, 0.22, 0.14)], "tunic", "hips")
box("belt", (0, 0, 0.63), (0.47, 0.31, 0.07), "belt", "hips")
box("buckle", (0, -0.16, 0.63), (0.09, 0.03, 0.09), "steel", "hips")
loft("chest", [(0, 0, 0.64, 0.21, 0.135), (0, 0, 1.02, 0.26, 0.15)], "tunic", "spine")
loft("mantle", [(0, 0.01, 0.88, 0.38, 0.28), (0, 0.01, 1.0, 0.35, 0.26), (0, 0.01, 1.1, 0.2, 0.18)], "cloak", "spine", n=8)

loft("hood", [
    (0, 0.0, 1.04, 0.2, 0.2), (0, 0.01, 1.16, 0.27, 0.275), (0, 0.02, 1.32, 0.26, 0.275),
    (0, 0.06, 1.45, 0.17, 0.19), (0, 0.12, 1.55, 0.04, 0.05),
], "hood", "head", n=8)
box("face", (0, -0.235, 1.24), (0.27, 0.1, 0.2), "face", "head")

loft("cape_upper", [(0, 0.21, 0.6, 0.33, 0.03), (0, 0.18, 1.04, 0.25, 0.03)], "cloak", "cape_U")
loft("cape_lower", [(0, 0.26, 0.22, 0.39, 0.03), (0, 0.21, 0.6, 0.33, 0.03)], "cloak_dark", "cape_L")
for i, (tx, length) in enumerate(((-0.26, 0.11), (0.0, 0.17), (0.26, 0.08))):
    box(f"cape_tatter_{i}", (tx, 0.265, 0.22 - length / 2), (0.2, 0.06, length), "cloak_dark", "cape_L")

loft("arm_L", [(0.31, 0, 0.62, 0.07, 0.08), (0.31, 0, 1.0, 0.085, 0.09)], "tunic", "arm_L")
box("hand_L", (0.31, 0, 0.56), (0.11, 0.11, 0.11), "skin", "arm_L")

SHOULDER_R = Vector((-0.29, -0.02, 0.98))
HAND_R = Vector((-0.52, -0.16, 1.38))            # raised up and out, so the lantern reads from behind
xf, length = along(SHOULDER_R, HAND_R)
loft("arm_R", [(0, 0, 0, 0.085, 0.085), (0, 0, length, 0.07, 0.07)], "tunic", "arm_R", xf=xf)
box("hand_R", tuple(HAND_R), (0.11, 0.11, 0.11), "skin", "arm_R")

LX, LY, LZ = HAND_R.x, HAND_R.y, HAND_R.z - 0.13       # top of the lantern
box("lantern_handle", (LX, LY, LZ + 0.06), (0.04, 0.04, 0.12), "metal", "lantern")
loft("lantern_cap", [(LX, LY, LZ - 0.06, 0.14, 0.14), (LX, LY, LZ, 0.04, 0.04)], "metal", "lantern")
box("lantern_core", (LX, LY, LZ - 0.2), (0.2, 0.2, 0.27), "glow_lantern", "lantern")
for i, (px, py) in enumerate(((1, 1), (1, -1), (-1, 1), (-1, -1))):
    box(f"lantern_post_{i}", (LX + px * 0.12, LY + py * 0.12, LZ - 0.2), (0.04, 0.04, 0.29), "metal", "lantern")
box("lantern_base", (LX, LY, LZ - 0.36), (0.28, 0.28, 0.05), "metal", "lantern")

HILT = Vector((0.28, -0.14, 0.7))
TIP = Vector((0.28, 0.4, 0.3))
xf, length = along(HILT, TIP)
loft("scabbard", [(0, 0, 0, 0.03, 0.05), (0, 0, length, 0.02, 0.035)], "scabbard", "hips", xf=xf)
loft("sword_grip", [(0, 0, -0.2, 0.025, 0.025), (0, 0, 0, 0.025, 0.025)], "steel", "hips", xf=xf)
loft("sword_guard", [(0, 0, -0.03, 0.035, 0.11), (0, 0, 0.01, 0.035, 0.11)], "belt", "hips", xf=xf)

# --- rig -------------------------------------------------------------------
BONES = [
    ("root", (0, 0, 0), (0, 0, 0.25), None),
    ("hips", (0, 0, 0.5), (0, 0, 0.66), "root"),
    ("spine", (0, 0, 0.66), (0, 0, 1.04), "hips"),
    ("head", (0, 0, 1.04), (0, 0, 1.5), "spine"),
    ("leg_L", (0.13, 0, 0.54), (0.13, 0, 0.05), "hips"),
    ("leg_R", (-0.13, 0, 0.54), (-0.13, 0, 0.05), "hips"),
    ("arm_L", (0.31, 0, 1.0), (0.31, 0, 0.58), "spine"),
    ("arm_R", tuple(SHOULDER_R), tuple(HAND_R), "spine"),
    ("lantern", tuple(HAND_R), (HAND_R.x, HAND_R.y, HAND_R.z - 0.45), "arm_R"),
    ("cape_U", (0, 0.18, 1.04), (0, 0.21, 0.6), "spine"),
    ("cape_L", (0, 0.21, 0.6), (0, 0.26, 0.22), "cape_U"),
]
arm_data = bpy.data.armatures.new("HeroRig")
rig = bpy.data.objects.new("Hero", arm_data)
COL.objects.link(rig)
with override():
    bpy.context.view_layer.objects.active = rig
    rig.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    for name, head, tail, parent in BONES:
        eb = arm_data.edit_bones.new(name)
        eb.head, eb.tail = head, tail
        if parent:
            eb.parent = arm_data.edit_bones[parent]
    bpy.ops.object.mode_set(mode="OBJECT")

for ob, bone_name in PARTS:
    bone = arm_data.bones[bone_name]
    ob.parent = rig
    ob.parent_type = "BONE"
    ob.parent_bone = bone_name
    # a bone parent's space sits at the bone's tail; keep the part where it was built
    ob.matrix_parent_inverse = (rig.matrix_world @ bone.matrix_local @ Matrix.Translation((0, bone.length, 0))).inverted()

# --- animation ---------------------------------------------------------------
X, Y, Z = Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1))
rig.animation_data_create()


def pose(name, frame, rots=(), lift=None):
    """Key a bone using rotations about world axes (and an optional world-space offset)."""
    pb = rig.pose.bones[name]
    inv = pb.bone.matrix_local.to_3x3().inverted()
    q = Quaternion()
    for axis, angle in rots:
        q = Quaternion(inv @ axis, angle) @ q
    pb.rotation_mode = "QUATERNION"
    pb.rotation_quaternion = q
    pb.keyframe_insert("rotation_quaternion", frame=frame)
    if lift is not None:
        pb.location = inv @ Vector(lift)
        pb.keyframe_insert("location", frame=frame)


def reset_pose():
    for pb in rig.pose.bones:
        pb.rotation_mode = "QUATERNION"
        pb.rotation_quaternion = Quaternion()
        pb.location = (0, 0, 0)


def make_action(name, length, step, fn):
    reset_pose()
    action = bpy.data.actions.new(name)
    rig.animation_data.action = action
    for f in range(0, length + 1, step):
        fn(f, 2 * math.pi * f / length)
    track = rig.animation_data.nla_tracks.new()
    track.name = name
    strip = track.strips.new(name, 0, action)
    strip.name = name
    rig.animation_data.action = None
    reset_pose()
    return action


def walk(f, p):
    s = math.sin(p)
    pose("leg_L", f, [(X, 0.7 * s)])
    pose("leg_R", f, [(X, -0.7 * s)])
    pose("hips", f, lift=(0, 0, 0.045 * abs(s)))
    pose("spine", f, [(X, 0.14), (Z, 0.09 * s)])
    pose("head", f, [(X, -0.07)])
    pose("arm_L", f, [(X, -0.55 * s)])
    pose("arm_R", f, [(X, 0.06 * math.sin(2 * p))])
    pose("lantern", f, [(Y, 0.2 * s), (X, 0.12 * math.sin(p + 1.0))])
    pose("cape_U", f, [(X, 0.3 + 0.08 * math.sin(2 * p))])
    pose("cape_L", f, [(X, 0.22 + 0.13 * math.sin(2 * p - 1.0))])


def idle(f, p):
    s = math.sin(p)
    pose("leg_L", f)
    pose("leg_R", f)
    pose("hips", f, lift=(0, 0, 0.012 * s))
    pose("spine", f, [(X, 0.02 * s)])
    pose("head", f, [(Z, 0.1 * s)])
    pose("arm_L", f, [(X, 0.03 * s)])
    pose("arm_R", f, [(X, 0.05 * s)])
    pose("lantern", f, [(Y, 0.09 * s), (X, 0.05 * math.sin(2 * p))])
    pose("cape_U", f, [(X, 0.04 + 0.03 * s)])
    pose("cape_L", f, [(X, 0.05 + 0.04 * math.sin(p - 0.8))])


make_action("Walk", 16, 2, walk)
make_action("Idle", 48, 6, idle)
scene.frame_start, scene.frame_end = 0, 48

# --- viewport niceties, save, export --------------------------------------------
for win in bpy.context.window_manager.windows:
    for area in win.screen.areas:
        if area.type == "VIEW_3D":
            area.spaces[0].shading.type = "SOLID"
            area.spaces[0].shading.color_type = "MATERIAL"

os.makedirs(os.path.dirname(GLB_PATH), exist_ok=True)
with override():
    bpy.ops.wm.save_as_mainfile(filepath=BLEND_PATH)
    bpy.ops.export_scene.gltf(
        filepath=GLB_PATH, export_format="GLB", export_yup=True,
        export_animations=True, export_animation_mode="NLA_TRACKS",
        export_cameras=False, export_lights=False,
    )

tris = sum(len(p.vertices) - 2 for ob, _ in PARTS for p in ob.data.polygons)
print(f"HERO_BUILT parts={len(PARTS)} tris={tris} bones={len(BONES)} glb={os.path.getsize(GLB_PATH)} bytes")
