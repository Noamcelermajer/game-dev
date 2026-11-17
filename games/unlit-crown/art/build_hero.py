"""Builds the Kindled hero (Ashblade): hooded figure, lantern in the right hand,
greatsword in the left, with idle, walk, three attacks, roll, hurt and death.

Run headless:   blender --background --python art/build_hero.py
Or live inside Blender (it replaces the current scene's objects).

Outputs: art/hero.blend (editable, not committed) and assets/hero.glb.
"""
import math
import os
import sys

ROOT = globals().get("UNLIT_ROOT") or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "art"))
import importlib

import rigkit

importlib.reload(rigkit)
from mathutils import Vector
from rigkit import X, Y, Z, Rig, ease, span

rigkit.reset_scene()
r = Rig("Hero", {
    "cloak": "#9a1f2c", "cloak_dark": "#6e1622", "hood": "#b02a36", "face": "#120c10",
    "tunic": "#5a4a44", "legs": "#2a2428", "boots": "#1e1818", "belt": "#8a6a30",
    "skin": "#c89a78", "metal": "#1c1614", "steel": "#aab0c0", "scabbard": "#3a2a22",
    "glow_lantern": "#ffb040", "glow_ember": "#ff7a20",
})

# --- body: 1.55 units tall, facing -Y; the hero's left is +X ----------------------
for side, x in (("L", 0.13), ("R", -0.13)):
    r.loft(f"leg_{side}", [(x, 0, 0.12, 0.085, 0.09), (x, 0, 0.54, 0.105, 0.11)], "legs", f"leg_{side}")
    r.loft(f"boot_{side}", [(x, -0.03, 0.0, 0.1, 0.145), (x, -0.02, 0.17, 0.095, 0.12)], "boots", f"leg_{side}")

r.loft("tunic_skirt", [(0, 0, 0.4, 0.26, 0.16), (0, 0, 0.62, 0.22, 0.14)], "tunic", "hips")
r.box("belt", (0, 0, 0.63), (0.47, 0.31, 0.07), "belt", "hips")
r.box("buckle", (0, -0.16, 0.63), (0.09, 0.03, 0.09), "steel", "hips")
r.loft("chest", [(0, 0, 0.64, 0.21, 0.135), (0, 0, 1.02, 0.26, 0.15)], "tunic", "spine")
r.loft("mantle", [(0, 0.01, 0.88, 0.38, 0.28), (0, 0.01, 1.0, 0.35, 0.26), (0, 0.01, 1.1, 0.2, 0.18)], "cloak", "spine", n=8)

r.loft("hood", [
    (0, 0.0, 1.04, 0.2, 0.2), (0, 0.01, 1.16, 0.27, 0.275), (0, 0.02, 1.32, 0.26, 0.275),
    (0, 0.06, 1.45, 0.17, 0.19), (0, 0.12, 1.55, 0.04, 0.05),
], "hood", "head", n=8)
r.box("face", (0, -0.235, 1.24), (0.27, 0.1, 0.2), "face", "head")

r.loft("cape_upper", [(0, 0.21, 0.6, 0.33, 0.03), (0, 0.18, 1.04, 0.25, 0.03)], "cloak", "cape_U")
r.loft("cape_lower", [(0, 0.26, 0.22, 0.39, 0.03), (0, 0.21, 0.6, 0.33, 0.03)], "cloak_dark", "cape_L")
for i, (tx, length) in enumerate(((-0.26, 0.11), (0.0, 0.17), (0.26, 0.08))):
    r.box(f"cape_tatter_{i}", (tx, 0.265, 0.22 - length / 2), (0.2, 0.06, length), "cloak_dark", "cape_L")

# left arm hangs at the side and carries the greatsword, tip trailing behind
HAND_L = Vector((0.33, 0.0, 0.56))
r.loft("arm_L", [(0.31, 0, 0.62, 0.07, 0.08), (0.31, 0, 1.0, 0.085, 0.09)], "tunic", "arm_L")
r.box("hand_L", tuple(HAND_L), (0.12, 0.12, 0.12), "skin", "arm_L")
TIP = HAND_L + Vector((0.05, 0.86, -0.42))
GRIP = HAND_L + (HAND_L - TIP).normalized() * 0.2
r.rod("sword_grip", GRIP, HAND_L, 0.028, "scabbard", "arm_L")
r.rod("sword_blade", HAND_L, TIP, 0.02, "steel", "arm_L", end_half=0.012, wide=3.4)
r.rod("sword_ember", HAND_L + (TIP - HAND_L) * 0.12, HAND_L + (TIP - HAND_L) * 0.9, 0.024, "glow_ember", "arm_L", end_half=0.016, wide=0.9)
guard = HAND_L + (TIP - HAND_L).normalized() * 0.03
r.box("sword_guard", tuple(guard), (0.26, 0.07, 0.07), "belt", "arm_L")

# right arm raised up and out, holding the lantern so it reads from behind
SHOULDER_R = Vector((-0.29, -0.02, 0.98))
HAND_R = Vector((-0.52, -0.16, 1.38))
r.rod("arm_R", SHOULDER_R, HAND_R, 0.085, "tunic", "arm_R", end_half=0.07)
r.box("hand_R", tuple(HAND_R), (0.11, 0.11, 0.11), "skin", "arm_R")
LX, LY, LZ = HAND_R.x, HAND_R.y, HAND_R.z - 0.13
r.box("lantern_handle", (LX, LY, LZ + 0.06), (0.04, 0.04, 0.12), "metal", "lantern")
r.loft("lantern_cap", [(LX, LY, LZ - 0.06, 0.14, 0.14), (LX, LY, LZ, 0.04, 0.04)], "metal", "lantern")
r.box("lantern_core", (LX, LY, LZ - 0.2), (0.2, 0.2, 0.27), "glow_lantern", "lantern")
for i, (px, py) in enumerate(((1, 1), (1, -1), (-1, 1), (-1, -1))):
    r.box(f"lantern_post_{i}", (LX + px * 0.12, LY + py * 0.12, LZ - 0.2), (0.04, 0.04, 0.29), "metal", "lantern")
r.box("lantern_base", (LX, LY, LZ - 0.36), (0.28, 0.28, 0.05), "metal", "lantern")

# empty scabbard across the back
r.rod("scabbard", (0.2, 0.2, 1.0), (-0.24, 0.24, 0.42), 0.035, "scabbard", "spine", wide=1.5)

# --- rig -----------------------------------------------------------------------------
r.bone("root", (0, 0, 0), (0, 0, 0.25))
r.bone("hips", (0, 0, 0.5), (0, 0, 0.66), "root")
r.bone("spine", (0, 0, 0.66), (0, 0, 1.04), "hips")
r.bone("head", (0, 0, 1.04), (0, 0, 1.5), "spine")
r.bone("leg_L", (0.13, 0, 0.54), (0.13, 0, 0.05), "hips")
r.bone("leg_R", (-0.13, 0, 0.54), (-0.13, 0, 0.05), "hips")
r.bone("arm_L", (0.31, 0, 1.0), (0.31, 0, 0.58), "spine")
r.bone("arm_R", SHOULDER_R, HAND_R, "spine")
r.bone("lantern", HAND_R, (HAND_R.x, HAND_R.y, HAND_R.z - 0.45), "arm_R")
r.bone("cape_U", (0, 0.18, 1.04), (0, 0.21, 0.6), "spine")
r.bone("cape_L", (0, 0.21, 0.6), (0, 0.26, 0.22), "cape_U")
r.build()
P = r.pose
TAU = 2 * math.pi


# --- animations ------------------------------------------------------------------------
# Rotation notes: +X tilts the top forward; for a hanging limb, -X swings it forward.
# +Z turns toward the hero's left (+X).
def idle(f, t):
    s = math.sin(TAU * t)
    P("leg_L", f); P("leg_R", f)
    P("hips", f, lift=(0, 0, 0.012 * s))
    P("spine", f, [(X, 0.02 * s)])
    P("head", f, [(Z, 0.1 * s)])
    P("arm_L", f, [(X, 0.03 * s)])
    P("arm_R", f, [(X, 0.05 * s)])
    P("lantern", f, [(Y, 0.09 * s), (X, 0.05 * math.sin(2 * TAU * t))])
    P("cape_U", f, [(X, 0.04 + 0.03 * s)])
    P("cape_L", f, [(X, 0.05 + 0.04 * math.sin(TAU * t - 0.8))])


def walk(f, t):
    s = math.sin(TAU * t)
    P("leg_L", f, [(X, 0.7 * s)])
    P("leg_R", f, [(X, -0.7 * s)])
    P("hips", f, lift=(0, 0, 0.045 * abs(s)))
    P("spine", f, [(X, 0.14), (Z, 0.09 * s)])
    P("head", f, [(X, -0.07)])
    P("arm_L", f, [(X, -0.25 * s)])
    P("arm_R", f, [(X, 0.06 * math.sin(2 * TAU * t))])
    P("lantern", f, [(Y, 0.2 * s), (X, 0.12 * math.sin(TAU * t + 1.0))])
    P("cape_U", f, [(X, 0.3 + 0.08 * math.sin(2 * TAU * t))])
    P("cape_L", f, [(X, 0.22 + 0.13 * math.sin(2 * TAU * t - 1.0))])


def slash(direction):
    """A horizontal sweep. direction +1 starts on the hero's left and cuts to the right."""
    def fn(f, t):
        wind = ease(span(t, 0.0, 0.25))
        cut = ease(span(t, 0.25, 0.5))
        back = ease(span(t, 0.6, 1.0))
        yaw = direction * (1.5 * wind - 3.0 * cut + 1.5 * back)
        raise_ = -2.1 * wind * (1 - back)
        P("arm_L", f, [(X, raise_), (Z, yaw)])
        P("spine", f, [(X, 0.12 * wind * (1 - back)), (Z, yaw * 0.45)])
        P("hips", f, [(Z, yaw * 0.15)], lift=(0, 0, -0.05 * wind * (1 - back)))
        P("head", f, [(Z, -yaw * 0.3)])
        P("leg_L", f, [(X, -0.35 * cut * (1 - back))])
        P("leg_R", f, [(X, 0.3 * cut * (1 - back))])
        P("arm_R", f, [(X, 0.15 * cut * (1 - back))])
        P("lantern", f, [(Y, -0.3 * direction * cut * (1 - back))])
        P("cape_U", f, [(X, 0.2 + 0.3 * cut * (1 - back)), (Z, -yaw * 0.3)])
        P("cape_L", f, [(X, 0.15 + 0.3 * cut * (1 - back))])
    return fn


def overhead(f, t):
    wind = ease(span(t, 0.0, 0.33))
    cut = ease(span(t, 0.33, 0.52))
    back = ease(span(t, 0.65, 1.0))
    raise_ = (-3.3 * wind + 2.3 * cut) * (1 - back)
    lean = (-0.25 * wind + 0.7 * cut) * (1 - back)
    P("arm_L", f, [(X, raise_), (Z, -0.25 * wind * (1 - back))])
    P("spine", f, [(X, lean)])
    P("hips", f, lift=(0, 0, -0.1 * cut * (1 - back)))
    P("head", f, [(X, -lean * 0.5)])
    P("leg_L", f, [(X, -0.45 * cut * (1 - back))])
    P("leg_R", f, [(X, 0.35 * cut * (1 - back))])
    P("arm_R", f, [(X, 0.25 * cut * (1 - back))])
    P("lantern", f, [(X, 0.3 * cut * (1 - back))])
    P("cape_U", f, [(X, 0.15 + 0.5 * cut * (1 - back))])
    P("cape_L", f, [(X, 0.1 + 0.4 * cut * (1 - back))])


def roll(f, t):
    tuck = math.sin(math.pi * t)
    P("hips", f, [(X, TAU * ease(t))], lift=(0, 0, -0.22 * tuck))
    P("spine", f, [(X, 0.5 * tuck)])
    P("head", f, [(X, 0.4 * tuck)])
    P("leg_L", f, [(X, -1.1 * tuck)])
    P("leg_R", f, [(X, -1.1 * tuck)])
    P("arm_L", f, [(X, 0.5 * tuck)])
    P("arm_R", f, [(X, 0.9 * tuck)])
    P("lantern", f, [(X, -0.5 * tuck)])
    P("cape_U", f, [(X, 0.6 * tuck)])
    P("cape_L", f, [(X, 0.4 * tuck)])


def hurt(f, t):
    k = math.sin(math.pi * min(1.0, t * 1.4)) * (1 - 0.3 * t)
    P("hips", f, lift=(0, 0, -0.04 * k))
    P("spine", f, [(X, -0.45 * k), (Z, 0.2 * k)])
    P("head", f, [(X, -0.35 * k)])
    P("arm_L", f, [(X, -0.5 * k), (Z, 0.4 * k)])
    P("arm_R", f, [(X, -0.3 * k)])
    P("lantern", f, [(X, 0.5 * k)])
    P("leg_L", f, [(X, 0.25 * k)]); P("leg_R", f, [(X, -0.15 * k)])
    P("cape_U", f, [(X, -0.1 * k)]); P("cape_L", f, [(X, 0.3 * k)])


def die(f, t):
    fall = ease(span(t, 0.0, 0.6))
    P("hips", f, [(X, -1.45 * fall)], lift=(0, 0.1 * fall, -0.36 * fall))
    P("spine", f, [(X, -0.2 * fall)])
    P("head", f, [(X, -0.3 * fall), (Z, 0.5 * fall)])
    P("arm_L", f, [(X, 0.4 * fall), (Z, 0.9 * fall)])
    P("arm_R", f, [(X, 1.2 * fall), (Z, -0.6 * fall)])
    P("lantern", f, [(X, -1.0 * fall)])
    P("leg_L", f, [(X, 0.5 * fall)]); P("leg_R", f, [(X, 0.2 * fall)])
    P("cape_U", f, [(X, 0.5 * fall)]); P("cape_L", f, [(X, 0.3 * fall)])


r.action("Idle", 48, idle, step=6)
r.action("Walk", 16, walk, step=2)
r.action("Attack1", 12, slash(+1))
r.action("Attack2", 12, slash(-1))
r.action("Attack3", 16, overhead)
r.action("Roll", 12, roll)
r.action("Hurt", 8, hurt)
r.action("Die", 20, die)
import bpy
bpy.context.scene.frame_start, bpy.context.scene.frame_end = 0, 48

r.finish(os.path.join(ROOT, "art", "hero.blend"), os.path.join(ROOT, "assets", "hero.glb"))
