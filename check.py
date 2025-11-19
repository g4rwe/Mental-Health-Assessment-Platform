import requests

# API endpoint
URL = "http://127.0.0.1:5000/predict"

# Example responses (20 answers for your frontend T20 questions)
# Replace these with actual values (e.g., "Not at all", "Several days", "More than half the days", "Nearly every day")
responses = [
    "Not at all", "Several days", "More than half the days", "Not at all", "Several days",
    "Not at all", "Several days", "Not at all", "Not at all", "Never",
    "Never", "Never", "Never", "Never",
    "Never", "Never", "Never", "Never", "Never", "Never"
]

# Send request
payload = {"responses": responses}
response = requests.post(URL, json=payload)

# Print result
if response.status_code == 200:
    result = response.json()
    print("Prediction:", result["prediction"])
    print("Probabilities:", result["probabilities"])
    print("Recommendation:", result["recommendation"])
else:
    print("Error:", response.status_code, response.text)
