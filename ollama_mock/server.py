from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route("/v1/info")
def info():
    return jsonify({"status": "ok", "model": "ollama-mock"})

@app.route("/v1/generate", methods=["POST"])
def generate():
    data = request.get_json(silent=True) or {}
    return jsonify({"status": "ok", "input": data})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=11434)
