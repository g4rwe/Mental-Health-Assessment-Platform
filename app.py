# app.py
"""
Flask API to serve PHQ-9-based depression severity predictions.
Accepts:
 - JSON body with "responses": [ ... ]  (array in frontend question order)
 OR
 - JSON object mapping frontend question text -> answer

It uses only the 9 PHQ-9 items (first 9 frontend items) to compute prediction.
"""

import joblib
import json
import numpy as np
from flask import Flask, request, jsonify

app = Flask(__name__)

MODEL_FILE = "best_depression_model.pkl"
META_FILE = "model_meta.json"

# Frontend list (20 questions) — ensure this is the same order used by frontend "responses" array.
FRONTEND_QUESTIONS = [
    "Over the past two weeks, how often have you been bothered by feeling down, depressed, or hopeless?",
    "How often have you had little interest or pleasure in doing things?",
    "How often have you had trouble falling or staying asleep, or sleeping too much?",
    "How often have you felt tired or had little energy?",
    "How often have you had poor appetite or overeating?",
    "How often have you felt bad about yourself or that you are a failure?",
    "How often have you had trouble concentrating on things?",
    "How often have you moved or spoken so slowly that others noticed?",
    "How often have you had thoughts that you would be better off dead?",
    # extras (10-20)
    "How often have you felt nervous, anxious, or on edge?",
    "How often have you been unable to stop or control worrying?",
    "How often have you worried too much about different things?",
    "How often have you had trouble relaxing?",
    "How often have you been restless or unable to sit still?",
    "How often have you become easily annoyed or irritable?",
    "How often have you felt afraid something awful might happen?",
    "How well have you been able to handle stress in your daily life?",
    "How satisfied are you with your relationships with family and friends?",
    "How would you rate your overall physical health?",
    "How optimistic do you feel about your future?"
]

# textual -> numeric mapping
RESPONSE_MAP = {
    "not at all": 0,
    "several days": 1,
    "more than half the days": 2,
    "more than half of the days": 2,
    "nearly every day": 3,
    "never": 0,
    "rarely": 0,
    "sometimes": 1,
    "often": 2,
    "always": 3
}

def parse_answer(v):
    # Accept numeric 0..3, 1..4, or textual
    if v is None:
        return None
    try:
        if isinstance(v, (int, float)) and not isinstance(v, bool):
            vi = int(v)
            if 0 <= vi <= 3:
                return vi
            if 1 <= vi <= 4:
                return vi - 1
    except:
        pass
    s = str(v).strip().lower()
    if s in RESPONSE_MAP:
        return RESPONSE_MAP[s]
    # fuzzy check substrings
    for k in RESPONSE_MAP:
        if k in s:
            return RESPONSE_MAP[k]
    # try extract single digit
    import re
    m = re.search(r"\d+", s)
    if m:
        try:
            val = int(m.group())
            if 0 <= val <= 3:
                return val
            if 1 <= val <= 4:
                return val - 1
        except:
            pass
    return None

# Load model + meta
model = joblib.load(MODEL_FILE)
with open(META_FILE, "r") as f:
    meta = json.load(f)
FEATURE_NAMES = meta["feature_names"]
LABEL_MAP = meta["label_map"]

RECOMMENDATIONS = {
    "Minimal": "Maintain healthy lifestyle and monitor wellbeing.",
    "Mild": "Consider self-care strategies and monitor changes; consider talking to a counselor if symptoms persist.",
    "Moderate": "Consider scheduling an appointment with a healthcare provider or counselor.",
    "Moderately Severe": "Seek professional mental health support soon; consider contacting campus health services.",
    "Severe": "Immediate professional help is strongly recommended. If you are at risk, contact emergency services."
}

MAPS_LINK = "https://www.google.com/maps/search/hospital+near+me"

@app.route("/")
def home():
    return "Depression Severity API (PHQ-9) — POST /predict with JSON"

@app.route("/predict", methods=["POST"])
def predict():
    payload = request.get_json(force=True, silent=True)
    if payload is None:
        return jsonify({"error":"Invalid or missing JSON payload"}), 400

    # Accept either "responses" list or dict mapping frontend questions -> answer
    responses_list = None
    if isinstance(payload, dict) and "responses" in payload:
        responses_list = payload["responses"]
    elif isinstance(payload, list):
        responses_list = payload
    elif isinstance(payload, dict):
        # try to extract frontend question keys (first 9)
        # Build list in FRONTEND_QUESTIONS order
        responses_list = []
        for q in FRONTEND_QUESTIONS:
            responses_list.append(payload.get(q, None))
    else:
        return jsonify({"error":"Payload must be a list or object (or contain key 'responses')"}), 400

    # Ensure we have at least 9 entries (PHQ-9)
    if len(responses_list) < 9:
        return jsonify({"error":"Need at least 9 responses (PHQ-9 order)"}), 400

    # Parse first 9 into numeric vector
    phq9_vals = []
    for i in range(9):
        v = responses_list[i]
        num = parse_answer(v)
        if num is None:
            return jsonify({"error":f"Could not parse response for PHQ item #{i+1}: {v}"}), 400
        phq9_vals.append(num)

    X = np.array(phq9_vals).reshape(1, -1)
    pred_label_idx = model.predict(X)[0]
    # Some models return numeric labels (0..4), some return strings; handle both
    try:
        pred_idx = int(pred_label_idx)
        pred_name = LABEL_MAP.get(str(pred_idx)) if isinstance(LABEL_MAP.keys().__iter__().__next__(), str) else LABEL_MAP.get(pred_idx, None)
        # LABEL_MAP in meta saved as int->name; but stored as dict in JSON keys are strings; handle both
        if pred_name is None:
            # try handle JSON keys as strings
            pred_name = LABEL_MAP.get(str(pred_idx), None)
        if pred_name is None:
            # fallback: if model returns names directly
            pred_name = str(pred_label_idx)
    except Exception:
        # model already returns name
        pred_name = str(pred_label_idx)

    # probabilities if available
    probs = None
    if hasattr(model, "predict_proba"):
        proba_arr = model.predict_proba(X)[0]  # shape (5,)
        # attempt to map class order to label names
        classes = model.classes_
        prob_map = {}
        for cls, p in zip(classes, proba_arr):
            try:
                cls_int = int(cls)
                name = LABEL_MAP.get(str(cls_int)) or LABEL_MAP.get(cls_int) or str(cls)
            except:
                name = str(cls)
            prob_map[name] = float(p)
        probs = prob_map

    # recommendation + maps link if severe
    rec_text = RECOMMENDATIONS.get(pred_name, "")
    extra = {}
    if pred_name in ("Moderately Severe", "Severe"):
        extra["maps_link"] = MAPS_LINK

    resp = {
        "prediction": pred_name,
        "probabilities": probs,
        "recommendation": rec_text
    }
    resp.update(extra)
    return jsonify(resp)

if __name__ == "__main__":
    app.run(debug=True)
