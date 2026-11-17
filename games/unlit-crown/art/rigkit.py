"""Shared helpers for the character build scripts (hero, enemies).

A character is rigid low-poly parts parented to the bones of a small armature,
with animations keyed by rotating bones about world axes. See docs/ART_DIRECTION.md
for the modelling rules. Characters face -Y in Blender, which is +Z in the game.
"""
import math
import os
from contextlib import nullcontext

import bmesh
import bpy
from mathutils import Matrix, Quaternion, Vector

X, Y, Z = Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1))
FPS = 24


def override():
    """Operators need a 3D viewport when run inside a live Blender; none headless."""
    for win in bpy.context.window_manager.windows:
        for area in win.screen.areas:
            if area.type == "VIEW_3D":
                region = next(r for r in area.regions if r.type == "WINDOW")
                return bpy.context.temp_override(window=win, area=area, region=region)
    return nullcontext()


def reset_scene():
    with override():
        if bpy.context.object and bpy.context.object.mode != "OBJECT":
            bpy.ops.object.mode_set(mode="OBJECT")
    for ob in list(bpy.data.objects):
        bpy.data.objects.remove(ob, do_unlink=True)
    for coll in (bpy.data.meshes, bpy.data.armatures, bpy.data.materials, bpy.data.actions, bpy.data.cameras, bpy.data.lights):
        for item in list(coll):
            if item.users == 0:
                coll.remove(item)
    bpy.context.scene.render.fps = FPS


def srgb(hexstr):
    r, g, b = (int(hexstr[i:i + 2], 16) / 255 for i in (1, 3, 5))
    lin = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (lin(r), lin(g), lin(b), 1.0)


def make_material(name, hexcol, glow=0.0):
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


class Rig:
    """Collects parts and bones, then builds the armature, animations and files.

    colours: {material name: hex} ; names starting with "glow" are emissive.
    """

    def __init__(self, name, colours):
        self.name = name
        self.col = bpy.context.scene.collection
        self.mats = {k: make_material(k, v, glow=4.0 if k.startswith("glow") else 0.0) for k, v in colours.items()}
        self.parts = []      # (object, bone name)
        self.bones = []      # (name, head, tail, parent)
        self.rig = None

    # --- geometry -----------------------------------------------------------
    def loft(self, name, rings, mat, bone, n=4, xf=None):
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
        me.materials.append(self.mats[mat])
        ob = bpy.data.objects.new(name, me)
        self.col.objects.link(ob)
        self.parts.append((ob, bone))
        return ob

    def box(self, name, center, size, mat, bone, xf=None):
        cx, cy, cz = center
        sx, sy, sz = size
        return self.loft(name, [(cx, cy, cz - sz / 2, sx / 2, sy / 2), (cx, cy, cz + sz / 2, sx / 2, sy / 2)], mat, bone, xf=xf)

    def rod(self, name, start, end, half, mat, bone, n=4, end_half=None, wide=1.0):
        """A tapered bar from start to end. wide stretches its cross-section along local X."""
        d = Vector(end) - Vector(start)
        rot = Vector((0, 0, 1)).rotation_difference(d.normalized()).to_matrix().to_4x4()
        xf = Matrix.Translation(start) @ rot
        e = half if end_half is None else end_half
        return self.loft(name, [(0, 0, 0, half * wide, half), (0, 0, d.length, e * wide, e)], mat, bone, n=n, xf=xf)

    # --- rig ----------------------------------------------------------------
    def bone(self, name, head, tail, parent=None):
        self.bones.append((name, tuple(head), tuple(tail), parent))

    def build(self):
        arm_data = bpy.data.armatures.new(self.name + "Rig")
        rig = bpy.data.objects.new(self.name, arm_data)
        self.col.objects.link(rig)
        with override():
            bpy.context.view_layer.objects.active = rig
            rig.select_set(True)
            bpy.ops.object.mode_set(mode="EDIT")
            for name, head, tail, parent in self.bones:
                eb = arm_data.edit_bones.new(name)
                eb.head, eb.tail = head, tail
                if parent:
                    eb.parent = arm_data.edit_bones[parent]
            bpy.ops.object.mode_set(mode="OBJECT")
        for ob, bone_name in self.parts:
            b = arm_data.bones[bone_name]
            ob.parent = rig
            ob.parent_type = "BONE"
            ob.parent_bone = bone_name
            # a bone parent's space sits at the bone's tail; keep the part where it was built
            ob.matrix_parent_inverse = (rig.matrix_world @ b.matrix_local @ Matrix.Translation((0, b.length, 0))).inverted()
        rig.animation_data_create()
        self.rig = rig
        return rig

    # --- animation ----------------------------------------------------------
    def pose(self, name, frame, rots=(), lift=None, scale=None):
        """Key a bone: rotations about world axes in order, a world-space offset, a scale."""
        pb = self.rig.pose.bones[name]
        inv = pb.bone.matrix_local.to_3x3().inverted()
        q = Quaternion()
        for axis, angle in rots:
            q = Quaternion(inv @ axis, angle) @ q
        pb.rotation_mode = "QUATERNION"
        prev = pb.get("_q")
        if prev is not None and Quaternion(prev).dot(q) < 0:   # keep to the short way round between keys
            q.negate()
        pb["_q"] = list(q)
        pb.rotation_quaternion = q
        pb.keyframe_insert("rotation_quaternion", frame=frame)
        if lift is not None:
            pb.location = inv @ Vector(lift)
            pb.keyframe_insert("location", frame=frame)
        if scale is not None:
            pb.scale = scale if hasattr(scale, "__len__") else (scale, scale, scale)
            pb.keyframe_insert("scale", frame=frame)

    def _reset_pose(self):
        for pb in self.rig.pose.bones:
            pb.rotation_mode = "QUATERNION"
            pb.rotation_quaternion = Quaternion()
            pb.location = (0, 0, 0)
            pb.scale = (1, 1, 1)
            if "_q" in pb:
                del pb["_q"]

    def action(self, name, length, fn, step=1):
        """fn(frame, t) keys every bone it animates; t runs 0..1 over the clip."""
        self._reset_pose()
        act = bpy.data.actions.new(name)
        self.rig.animation_data.action = act
        for f in range(0, length + 1, step):
            fn(f, f / length)
        track = self.rig.animation_data.nla_tracks.new()
        track.name = name
        track.strips.new(name, 0, act).name = name
        self.rig.animation_data.action = None
        self._reset_pose()

    # --- output -------------------------------------------------------------
    def finish(self, blend_path, glb_path):
        for win in bpy.context.window_manager.windows:
            for area in win.screen.areas:
                if area.type == "VIEW_3D":
                    area.spaces[0].shading.type = "SOLID"
                    area.spaces[0].shading.color_type = "MATERIAL"
        os.makedirs(os.path.dirname(glb_path), exist_ok=True)
        with override():
            bpy.ops.wm.save_as_mainfile(filepath=blend_path)
            bpy.ops.export_scene.gltf(
                filepath=glb_path, export_format="GLB", export_yup=True,
                export_animations=True, export_animation_mode="NLA_TRACKS",
                export_cameras=False, export_lights=False,
            )
        tris = sum(len(p.vertices) - 2 for ob, _ in self.parts for p in ob.data.polygons)
        clips = [t.name for t in self.rig.animation_data.nla_tracks]
        print(f"BUILT {self.name} parts={len(self.parts)} tris={tris} bones={len(self.bones)} clips={clips} glb={os.path.getsize(glb_path)} bytes")


def ease(t):
    """Smooth 0..1."""
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def span(t, a, b):
    """Progress 0..1 of t through the window [a, b]."""
    return max(0.0, min(1.0, (t - a) / (b - a)))
