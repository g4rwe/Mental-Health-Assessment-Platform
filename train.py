# train.py
"""
Train pipeline for PHQ-9 depression severity classifier.
- Reads Raw data (Excel or CSV)
- Extracts PHQ-9 items (handles long column names)
- Maps answers -> 0..3, computes PHQ9 total
- Creates 5-class label: Minimal(0), Mild(1), Moderate(2), Moderately Severe(3), Severe(4)
- Trains 3 models (LogisticRegression, RandomForest, GradientBoosting)
- Picks best model by F1-macro on test set and saves it with metadata
"""

import os
import json
import joblib
import warnings
from pprint import pprint

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, f1_score
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier

warnings.filterwarnings("ignore")

DATA_XLSX = "Raw data.xlsx"
DATA_CSV_FALLBACK = "Updated_PHQ9_Student_Dataset.csv"  # if Excel not present
OUT_MODEL = "best_depression_model.pkl"
OUT_META = "model_meta.json"  # stores feature names and label mapping

# Long column headers found in your Excel (exact strings from dataset)
PHQ9_LONG = [
    "18.1 Next, you will be asked questions about your emotional state. Please answer on a scale of 0 to 3, where 0 is 'Not at all', 1 is 'several days', 2 is 'more than half of the days', and 3 is 'Nearly every day'. Over the last two weeks, how often have you been bothered by the following problems?: Little interest or pleasure in doing things",
    "18.2 Next, you will be asked questions about your emotional state. Please answer on a scale of 0 to 3, where 0 is 'Not at all', 1 is 'several days', 2 is 'more than half of the days', and 3 is 'Nearly every day'. Over the last two weeks, how often have you been bothered by the following problems?: Feeling down, depressed, or hopeless",
    "18.3 Next, you will be asked questions about your emotional state. Please answer on a scale of 0 to 3, where 0 is 'Not at all', 1 is 'several days', 2 is 'more than half of the days', and 3 is 'Nearly every day'. Over the last two weeks, how often have you been bothered by the following problems?: Trouble falling or staying asleep, or sleeping too much",
    "18.4 Next, you will be asked questions about your emotional state. Please answer on a scale of 0 to 3, where 0 is 'Not at all', 1 is 'several days', 2 is 'more than half of the days', and 3 is 'Nearly every day'. Over the last two weeks, how often have you been bothered by the following problems?: Feeling tired or having little energy",
    "18.5 Next, you will be asked questions about your emotional state. Please answer on a scale of 0 to 3, where 0 is 'Not at all', 1 is 'several days', 2 is 'more than half of the days', and 3 is 'Nearly every day'. Over the last two weeks, how often have you been bothered by the following problems?: Poor appetite or overeating",
    "18.6 Next, you will be asked questions about your emotional state. Please answer on a scale of 0 to 3, where 0 is 'Not at all', 1 is 'several days', 2 is 'more than half of the days', and 3 is 'Nearly every day'. Over the last two weeks, how often have you been bothered by the following problems?: Feeling bad about yourself or that you are a failure or have let yourself or your family down",
    "18.7 Next, you will be asked questions about your emotional state. Please answer on a scale of 0 to 3, where 0 is 'Not at all', 1 is 'several days', 2 is 'more than half of the days', and 3 is 'Nearly every day'. Over the last two weeks, how often have you been bothered by the following problems?: Trouble concentrating on things, such as reading the newspaper or watching television",
    "18.8 Next, you will be asked questions about your emotional state. Please answer on a scale of 0 to 3, where 0 is 'Not at all', 1 is 'several days', 2 is 'more than half of the days', and 3 is 'Nearly every day'. Over the last two weeks, how often have you been bothered by the following problems?: Moving or speaking so slowly that other people could have noticed. Or the opposite being so figety or restless that you have been moving around a lot more than usual",
    "18.9 Next, you will be asked questions about your emotional state. Please answer on a scale of 0 to 3, where 0 is 'Not at all', 1 is 'several days', 2 is 'more than half of the days', and 3 is 'Nearly every day'. Over the last two weeks, how often have you been bothered by the following problems?: Thoughts that you would be better off dead, or of hurting yourself"
]

# Clean short feature names (used in model and Flask)
PHQ9_CLEAN = [
    "little_interest",
    "feeling_down",
    "trouble_sleep",
    "tired",
    "poor_appetite",
    "feeling_bad",
    "trouble_concentrating",
    "moving_slowly_or_fidgety",
    "thoughts_selfharm"
]

# Mapping for textual answers -> numeric 0..3
RESPONSE_MAP_STR = {
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

def read_data():
    # try Excel (header row is 1 in this file where row 1 contains questions)
    if os.path.exists(DATA_XLSX):
        try:
            df = pd.read_excel(DATA_XLSX, header=1)
            print(f"Loaded {DATA_XLSX} with shape {df.shape}")
            return df
        except Exception as e:
            print("Failed to read Excel:", e)
    # fallback to CSV if available
    if os.path.exists(DATA_CSV_FALLBACK):
        df = pd.read_csv(DATA_CSV_FALLBACK)
        print(f"Loaded {DATA_CSV_FALLBACK} with shape {df.shape}")
        return df
    raise FileNotFoundError("No input dataset found. Place Raw data.xlsx or Updated_PHQ9_Student_Dataset.csv in project folder.")

def find_columns(df):
    # ensure every long PHQ9 column is present or try fuzzy match by substring
    found = []
    cols = df.columns.tolist()
    for long in PHQ9_LONG:
        # exact match first
        if long in cols:
            found.append(long)
            continue
        # fuzzy: look for key phrase like 'Little interest' or '18.1' substring
        key = long.split("?:")[-1].strip()  # phrase after '?:'
        match = None
        for c in cols:
            if key.lower() in str(c).lower():
                match = c
                break
        if match:
            found.append(match)
        else:
            # try other keywords
            short_keywords = ["little interest", "feeling down", "trouble falling", "tired",
                              "poor appetite", "feeling bad about yourself", "trouble concentrating",
                              "moving or speaking", "thoughts that you would be better off dead"]
            matched = None
            for kw in short_keywords:
                if kw in long.lower():
                    for c in cols:
                        if kw in str(c).lower():
                            matched = c
                            break
                if matched:
                    break
            if matched:
                found.append(matched)
            else:
                found.append(None)
    return found

def map_answer(v):
    # accept numeric 0..3, or 1..4, or textual
    if pd.isna(v):
        return np.nan
    # integer-like
    try:
        if isinstance(v, (int, np.integer)):
            vi = int(v)
            if 0 <= vi <= 3:
                return vi
            if 1 <= vi <= 4:
                return vi - 1
        if isinstance(v, float) and not np.isnan(v):
            vf = float(v)
            if abs(vf - round(vf)) < 1e-6:
                vi = int(round(vf))
                if 0 <= vi <= 3:
                    return vi
                if 1 <= vi <= 4:
                    return vi - 1
    except Exception:
        pass
    s = str(v).strip().lower()
    if s in RESPONSE_MAP_STR:
        return RESPONSE_MAP_STR[s]
    # handle phrases
    for k in RESPONSE_MAP_STR:
        if k in s:
            return RESPONSE_MAP_STR[k]
    # try extract digit
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
    return np.nan

def phq_total_to_label(t):
    if pd.isna(t):
        return np.nan
    t = int(t)
    if t <= 4:
        return 0  # Minimal
    if 5 <= t <= 9:
        return 1  # Mild
    if 10 <= t <= 14:
        return 2  # Moderate
    if 15 <= t <= 19:
        return 3  # Moderately Severe
    return 4      # Severe

def label_to_name(lbl):
    names = {0:"Minimal",1:"Mild",2:"Moderate",3:"Moderately Severe",4:"Severe"}
    return names.get(int(lbl), "Unknown")

def main():
    df = read_data()
    found = find_columns(df)
    print("\nPHQ-9 column matching results:")
    for i, (long, f) in enumerate(zip(PHQ9_LONG, found), 1):
        print(f" {i}. -> {f}")

    if any(x is None for x in found):
        print("\nERROR: Some PHQ-9 columns not found. Please check dataset headers.")
        missing_idx = [i for i,x in enumerate(found) if x is None]
        print("Missing indices:", missing_idx)
        # still proceed but will raise later
        raise RuntimeError("PHQ-9 columns not all found. Aborting.")

    # Extract those columns and map -> clean names
    df_phq = df[found].copy()
    df_phq.columns = PHQ9_CLEAN

    # Map all answers to 0..3
    for c in PHQ9_CLEAN:
        df_phq[c] = df_phq[c].apply(map_answer)

    # Drop rows with any missing phq item
    before = len(df_phq)
    df_phq = df_phq.dropna(subset=PHQ9_CLEAN)
    after = len(df_phq)
    print(f"\nDropped {before-after} rows with missing PHQ items. Remaining: {after}")

    # compute total and label
    df_phq["PHQ9_total"] = df_phq[PHQ9_CLEAN].sum(axis=1).astype(int)
    df_phq["label"] = df_phq["PHQ9_total"].apply(phq_total_to_label).astype(int)
    df_phq["label_name"] = df_phq["label"].apply(label_to_name)

    print("\nLabel distribution:")
    print(df_phq["label_name"].value_counts())

    # Prepare X,y
    X = df_phq[PHQ9_CLEAN].values
    y = df_phq["label"].values

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Models to try
    models = {
        "LogisticRegression": LogisticRegression(max_iter=1000, multi_class="multinomial", solver="lbfgs"),
        "RandomForest": RandomForestClassifier(n_estimators=200, random_state=42),
        "GradientBoosting": GradientBoostingClassifier(n_estimators=200, random_state=42)
    }

    best_model = None
    best_score = -1
    results = {}

    for name, m in models.items():
        print(f"\nTraining {name} ...")
        m.fit(X_train, y_train)
        preds = m.predict(X_test)
        f1 = f1_score(y_test, preds, average="macro")
        results[name] = {"f1_macro": float(f1)}
        print(f"{name} F1-macro: {f1:.4f}")
        print(classification_report(y_test, preds, digits=3, zero_division=0))
        if f1 > best_score:
            best_score = f1
            best_model = (name, m)

    # Save best
    if best_model:
        name, model_obj = best_model
        joblib.dump(model_obj, OUT_MODEL)
        meta = {
            "model_name": name,
            "feature_names": PHQ9_CLEAN,
            "label_map": {0:"Minimal",1:"Mild",2:"Moderate",3:"Moderately Severe",4:"Severe"},
            "results": results
        }
        with open(OUT_META, "w") as f:
            json.dump(meta, f, indent=2)
        print(f"\n✅ Saved best model: {OUT_MODEL} ({name}), meta -> {OUT_META}")
    else:
        raise RuntimeError("No model trained")

if __name__ == "__main__":
    main()
