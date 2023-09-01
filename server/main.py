from __future__ import print_function

import uuid
import sys
import logging
import openai
import json
import requests

from flask import Flask, jsonify
from flask_cors import CORS, cross_origin
from flask import request

from job_processor import analyze_jobs

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("debug.log"),
        logging.StreamHandler(sys.stdout)
    ]
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("debug.log"),
        logging.StreamHandler(sys.stdout)
    ]
)


def create_app():
    session_id = str(uuid.uuid4().hex)
    app = Flask(__name__)
    app.session_id = session_id
    # log session id
    logging.info(f"session_id: {session_id}")
    app.config["file_text_dict"] = {}
    CORS(app, supports_credentials=True)

    return app


app = create_app()


@app.route(f"/analyze", methods=["POST"])
@cross_origin(supports_credentials=True)
def process_job():
    try:
        params = request.get_json()
        properties = params["fields"]
        answer = analyze_jobs(properties)
        return answer
    except Exception as e:
        logging.error(e)
        return str(e)


@app.route(f"/load", methods=["GET"])
@cross_origin(supports_credentials=True)
def load_jobs():
    data_results = []
    data_criteria = []
    try:
        with open('results.json', 'r') as json_file_results:
            data_results = json.load(json_file_results)
    except Exception as e:
        logging.error(e)
    try:
        with open('criteria.json', 'r') as json_file_criteria:
            data_criteria = json.load(json_file_criteria)
    except Exception as e:
        logging.error(e)
    return jsonify({"results": data_results, "criteria": data_criteria})


@app.route("/healthcheck", methods=["GET"])
@cross_origin(supports_credentials=True)
def healthcheck():
    return "OK"


if __name__ == "__main__":
    app.run(debug=True, port="8080", threaded=True)
