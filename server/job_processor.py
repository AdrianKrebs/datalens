from __future__ import print_function

import json
import os
import requests

import openai

import logging

from flask import jsonify

# Set API Keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
assert OPENAI_API_KEY, "OPENAI_API_KEY environment variable is missing from .env"
openai.api_key = OPENAI_API_KEY

OPENAI_API_MODEL = os.getenv("OPENAI_API_MODEL", "gpt-4-0613")
assert OPENAI_API_MODEL, "OPENAI_API_MODEL environment variable is missing from .env"


def map_frontend_to_api(frontend_criteria):
    api_criteria = {
        "type": "object",
        "properties": {},
        "required": [item['name'] for item in frontend_criteria]
    }
    for item in frontend_criteria:
        snake_case = item['name'].replace(" ", "_").lower()
        api_criteria["properties"][snake_case] = {
            "type": "number",
            "description": "1 indicates a perfect fit and 0 indicates no fit."
        }
    return api_criteria


def assessJobs(properties):
    url = 'http://hn.algolia.com/api/v1/items/36152014'
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        children_posts = data['children']
    else:
        print(f"Failed to fetch data. Status code: {response.status_code}")
        return

    jobs = children_posts[:40]

    # Load previously analyzed jobs if the file exists
    try:
        with open('results.json', 'r') as json_file_results:
            previous_results = json.load(json_file_results)
        with open('criteria.json', 'r') as json_file_criteria:
            previous_criteria = json.load(json_file_criteria)
        previous_ids = [result["id"] for result in previous_results]
    except FileNotFoundError:
        previous_results = []
        previous_criteria = None
        previous_ids = []

        # Check if the criteria have changed
    criteria_changed = previous_criteria != properties

    results = previous_results.copy()
    schema = map_frontend_to_api(properties)
    for job in jobs:
        if not criteria_changed and job["id"] in previous_ids:
            continue
        try:
            completion = openai.ChatCompletion.create(
                model=OPENAI_API_MODEL,
                messages=[
                    {"role": "system",
                     "content": "You're a job search assistant."},
                    {"role": "user",
                     "content": f"You will be provided with a job description. Your task is to evaluate how well the job aligns with each of the specified filter criteria. The output should be a likelihood score ranging from 0 to 1 (where 0 indicates no fit, and 1 indicates a perfect fit), formatted in JSON. Please note that the score should not exceed 1. In situations where the job description doesn't contain any information related to a given criterion, assign a score of 0 to it. If the job only partly fits a specific criterion, use a lower number like 0.5 and not 1.0. For the location, assign a score of 1 if the job is based in the user's home country, if it's remote with no geographical restrictions, or if it's remote and allows workers from the user's home continent. Assign a score of 0 if the job is remote but restricted to a different country or continent. \n Here are the criteria to consider: {properties}. \n Now, please analyze the following job posting and provide the scores from 0 - 1: \n {job['text']} "}
                ],
                temperature=0.05,
                max_tokens=256,
                top_p=1,
                functions=[{"name": "classify_job", "parameters": schema}],
                function_call={"name": "classify_job"},
            )
            print(completion["usage"]["total_tokens"])
            result_schema = json.loads(completion.choices[0].message.function_call.arguments)
            print(result_schema)
            results.append({"id": job["id"], "text": job["text"], "result": result_schema,
                            "totalScore": sum(result_schema.values())})
        except Exception as e:
            logging.info(f"[get_answer_from_files] error: {e}")
            return str(e)
    with open('results.json', 'w') as json_file_results:
        json.dump(results, json_file_results)
    with open('criteria.json', 'w') as json_file_criteria:
        json.dump(properties, json_file_criteria)
    return jsonify({"results": results})
