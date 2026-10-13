# -*- coding: utf-8 -*-
"""
Create Archicad stairs from Rhino through the Tapir add-on.

Run inside Rhino (Rhino 7 IronPython or Rhino 8 CPython), either:
  - via Rhino MCP: paste this file into execute_rhinoscript_python_code, or
  - in Rhino: _ScriptEditor / _EditPythonScript -> run.

Requirements: Archicad open with a project, Tapir add-on installed
(Archicad JSON API listens on http://127.0.0.1:19723 by default).

Optional: select a polyline/curve in Rhino before running - its control
points become the stair baseline (2 points = straight, 3+ = L/U stair).
Otherwise the default STAIRS list below is used. Units: metres.
"""
import json

try:  # Rhino 8 CPython
    from urllib.request import Request, urlopen
except ImportError:  # Rhino 7 IronPython 2.7
    from urllib2 import Request, urlopen

ARCHICAD_URL = "http://127.0.0.1:19723"

# Default stairs (used when nothing is selected in Rhino).
STAIRS = [
    {   # straight flight
        "baseLinePoints": [{"x": 0.0, "y": 0.0}, {"x": 4.5, "y": 0.0}],
        "zCoordinate": 0.0,
        "totalHeight": 3.0,
        "flightWidth": 1.2,
        "stepNum": 17,
    },
    {   # L-shaped stair
        "baseLinePoints": [{"x": 8.0, "y": 0.0}, {"x": 11.0, "y": 0.0},
                           {"x": 11.0, "y": 3.0}],
        "zCoordinate": 0.0,
        "totalHeight": 3.0,
        "flightWidth": 1.2,
    },
    {   # U-shaped stair
        "baseLinePoints": [{"x": 16.0, "y": 0.0}, {"x": 19.0, "y": 0.0},
                           {"x": 19.0, "y": 2.6}, {"x": 16.0, "y": 2.6}],
        "zCoordinate": 0.0,
        "totalHeight": 3.0,
        "flightWidth": 1.1,
    },
]


def run_command(command, parameters):
    body = json.dumps({"command": command, "parameters": parameters}).encode("utf8")
    req = Request(ARCHICAD_URL, body, {"Content-Type": "application/json"})
    resp = json.loads(urlopen(req).read())
    if not resp.get("succeeded"):
        raise RuntimeError("Archicad error: %s" % resp.get("error"))
    return resp["result"]


def run_tapir(command, parameters):
    result = run_command("API.ExecuteAddOnCommand", {
        "addOnCommandId": {"commandNamespace": "TapirCommand", "commandName": command},
        "addOnCommandParameters": parameters,
    })["addOnCommandResponse"]
    if "error" in result:
        raise RuntimeError("Tapir error: %s" % result["error"])
    return result


def stairs_from_rhino_selection():
    """Turn selected Rhino curves into stair baselines (empty list if none/not in Rhino)."""
    try:
        import rhinoscriptsyntax as rs
    except ImportError:
        return []
    ids = rs.SelectedObjects() or []
    stairs = []
    for obj in ids:
        if not rs.IsCurve(obj):
            continue
        pts = rs.CurvePoints(obj) if rs.IsPolyline(obj) else rs.CurveEditPoints(obj)
        if not pts or len(pts) < 2:
            continue
        stairs.append({
            "baseLinePoints": [{"x": p.X, "y": p.Y} for p in pts],
            "zCoordinate": pts[0].Z,
            "totalHeight": 3.0,
            "flightWidth": 1.2,
        })
    return stairs


def main():
    stairs = stairs_from_rhino_selection() or STAIRS
    result = run_tapir("CreateStairs", {"stairsData": stairs})
    for i, item in enumerate(result["elements"]):
        if "elementId" in item:
            print("Stair %d created: %s" % (i + 1, item["elementId"]["guid"]))
        else:
            print("Stair %d failed: %s" % (i + 1, item.get("error")))


main()
