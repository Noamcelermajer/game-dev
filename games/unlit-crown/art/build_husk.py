"""Builds the Wax Husk: a slumped figure of melting wax with a lit wick, the first
enemy of Waxmere. Slow, long-armed, hits hard after an obvious wind-up.

Run headless:   blender --background --python art/build_husk.py
Or live inside Blender (it replaces the current scene's objects).

Outputs: art/husk.blend (editable, not committed) and assets/husk.glb.
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
r = Rig("Husk", {
    "wax": "#d9cdb0", "wax_mid": "#b8a888", "wax_dark": "#8a7a66",
    "dark": "#1a1210", "wick": "#2a2018", "glow_wick": "#ffc050",
})

# --- body: about 1.7 tall, hunched, facing -Y ------------------------------------------
for side, x in (("L", 0.17), ("R", -0.17)):
    r.loft(f"leg_{side}", [(x, 0.02, 0.0, 0.17, 0.19), (x, 0.02, 0.1, 0.13, 0.14), (x, 0.02, 0.52, 0.115, 0.12)], "wax_mid", f"leg_{side}", n=6)
r.loft("puddle", [(0, 0.03, 0.0, 0.46, 0.4), (0, 0.03, 0.04, 0.4, 0.34)], "wax_dark", "root", n=8)

r.loft("torso", [
    (0, 0.04, 0.44, 0.27, 0.21), (0, 0.07, 0.8, 0.34, 0.26), (0, 0.03, 1.14, 0.32, 0.24), (0, -0.05, 1.3, 0.2, 0.17),
], "wax", "body", n=8)
for i, (dx, dy, top, length) in enumerate(((0.3, 0.0, 0.95, 0.3), (-0.31, 0.05, 0.85, 0.22), (0.12, 0.27, 0.9, 0.34), (-0.1, -0.2, 0.78, 0.2), (0.22, -0.16, 1.02, 0.16))):
    r.box(f"drip_{i}", (dx, dy + 0.05, top - length / 2), (0.07, 0.07, length), "wax_mid", "body")   # wax running down

r.loft("head", [
    (0, -0.1, 1.27, 0.15, 0.15), (0, -0.13, 1.4, 0.2, 0.2), (0, -0.12, 1.55, 0.18, 0.18), (0, -0.1, 1.65, 0.09, 0.09),
], "wax", "head", n=8)
for sx in (-1, 1):
    r.box(f"eye_{'L' if sx > 0 else 'R'}", (sx * 0.08, -0.31, 1.45), (0.07, 0.05, 0.09), "dark", "head")
r.box("mouth", (0, -0.31, 1.33), (0.12, 0.05, 0.05), "dark", "head")
r.box("wick", (0, -0.1, 1.7), (0.035, 0.035, 0.12), "wick", "head")
r.loft("flame", [(0, -0.1, 1.76, 0.02, 0.02), (0, -0.1, 1.84, 0.07, 0.07), (0, -0.1, 2.02, 0.01, 0.01)], "glow_wick", "head")

# long arms hanging forward, with heavy blob hands
for side, sx in (("L", 1), ("R", -1)):
    shoulder = Vector((sx * 0.33, -0.02, 1.18))
    hand = Vector((sx * 0.43, -0.24, 0.42))
    r.rod(f"arm_{side}", shoulder, hand, 0.1, "wax", f"arm_{side}", n=6, end_half=0.085)
    r.loft(f"hand_{side}", [(hand.x, hand.y, hand.z - 0.16, 0.08, 0.08), (hand.x, hand.y, hand.z - 0.04, 0.14, 0.15), (hand.x, hand.y, hand.z + 0.06, 0.11, 0.12)], "wax_mid", f"arm_{side}", n=6)

# --- rig -----------------------------------------------------------------------------
r.bone("root", (0, 0, 0), (0, 0, 0.25))
r.bone("body", (0, 0.04, 0.44), (0, 0, 1.26), "root")
r.bone("head", (0, -0.08, 1.26), (0, -0.1, 1.66), "body")
r.bone("leg_L", (0.17, 0.02, 0.52), (0.17, 0.02, 0.03), "root")
r.bone("leg_R", (-0.17, 0.02, 0.52), (-0.17, 0.02, 0.03), "root")
r.bone("arm_L", (0.33, -0.02, 1.18), (0.43, -0.24, 0.42), "body")
r.bone("arm_R", (-0.33, -0.02, 1.18), (-0.43, -0.24, 0.42), "body")
r.build()
P = r.pose
TAU = 2 * math.pi


# +X tilts the top forward; for a hanging limb, -X swings it forward.
def idle(f, t):
    s = math.sin(TAU * t)
    P("root", f)
    P("body", f, [(X, 0.12 + 0.04 * s), (Y, 0.05 * s)])
    P("head", f, [(X, 0.1), (Z, 0.15 * s)])
    P("arm_L", f, [(X, 0.08 * s)]); P("arm_R", f, [(X, -0.08 * s)])
    P("leg_L", f); P("leg_R", f)


def walk(f, t):
    s = math.sin(TAU * t)
    P("root", f, lift=(0, 0, 0.03 * abs(s)))
    P("body", f, [(X, 0.22), (Y, 0.14 * s)])
    P("head", f, [(X, 0.05), (Y, -0.1 * s)])
    P("arm_L", f, [(X, -0.35 + 0.3 * s)]); P("arm_R", f, [(X, -0.35 - 0.3 * s)])
    P("leg_L", f, [(X, 0.45 * s)]); P("leg_R", f, [(X, -0.45 * s)])


def windup(f, t):
    k = ease(t)
    P("root", f, lift=(0, 0, 0.04 * k))
    P("body", f, [(X, 0.12 - 0.42 * k)])
    P("head", f, [(X, -0.3 * k)])
    P("arm_L", f, [(X, -3.0 * k), (Z, 0.2 * k)]); P("arm_R", f, [(X, -3.0 * k), (Z, -0.2 * k)])
    P("leg_L", f, [(X, -0.15 * k)]); P("leg_R", f, [(X, 0.1 * k)])


def attack(f, t):
    hit = ease(span(t, 0.0, 0.3))
    back = ease(span(t, 0.55, 1.0))
    k = hit * (1 - back)
    P("root", f, lift=(0, 0, 0.04 * (1 - hit)))
    P("body", f, [(X, -0.3 + 0.95 * hit - 0.53 * back)])
    P("head", f, [(X, -0.3 + 0.6 * hit - 0.2 * back)])
    arm = -3.0 + 2.2 * hit + 0.8 * back
    P("arm_L", f, [(X, arm), (Z, 0.2 * (1 - hit))]); P("arm_R", f, [(X, arm), (Z, -0.2 * (1 - hit))])
    P("leg_L", f, [(X, -0.15 + 0.5 * k)]); P("leg_R", f, [(X, 0.1 - 0.3 * k)])


def hurt(f, t):
    k = math.sin(math.pi * min(1.0, t * 1.3)) * (1 - 0.3 * t)
    P("root", f)
    P("body", f, [(X, 0.12 - 0.55 * k), (Y, 0.2 * k)])
    P("head", f, [(X, -0.4 * k)])
    P("arm_L", f, [(X, -0.9 * k), (Z, 0.5 * k)]); P("arm_R", f, [(X, -0.6 * k), (Z, -0.5 * k)])
    P("leg_L", f); P("leg_R", f)


def die(f, t):
    melt = ease(span(t, 0.0, 0.85))
    P("root", f, scale=(1 + 0.6 * melt, 1 - 0.86 * melt, 1 + 0.6 * melt))     # bone Y is up: sink into a puddle
    P("body", f, [(X, 0.12 + 0.5 * melt)])
    P("head", f, [(X, 0.6 * melt)])
    P("arm_L", f, [(X, 0.3 * melt), (Z, 0.7 * melt)]); P("arm_R", f, [(X, 0.3 * melt), (Z, -0.7 * melt)])
    P("leg_L", f); P("leg_R", f)


def rise(f, t):
    up = ease(t)
    P("root", f, scale=(1.6 - 0.6 * up, 0.14 + 0.86 * up, 1.6 - 0.6 * up))    # pulls itself up out of a puddle
    P("body", f, [(X, 0.12 + 0.5 * (1 - up))])
    P("head", f, [(X, 0.6 * (1 - up))])
    P("arm_L", f, [(X, 0.3 * (1 - up))]); P("arm_R", f, [(X, 0.3 * (1 - up))])
    P("leg_L", f); P("leg_R", f)


r.action("Idle", 48, idle, step=6)
r.action("Walk", 24, walk, step=2)
r.action("Windup", 12, windup)
r.action("Attack", 14, attack)
r.action("Hurt", 8, hurt)
r.action("Die", 20, die)
r.action("Rise", 14, rise)

r.finish(os.path.join(ROOT, "art", "husk.blend"), os.path.join(ROOT, "assets", "husk.glb"))
