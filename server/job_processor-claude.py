from __future__ import print_function

import json
import os
import re
import requests

import openai
from anthropic import Anthropic, HUMAN_PROMPT, AI_PROMPT

import pymongo

import logging

from flask import jsonify


ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
assert ANTHROPIC_API_KEY, "ANTHROPIC_API_KEY environment variable is missing from .env"

anthropic = Anthropic(
    # defaults to os.environ.get("ANTHROPIC_API_KEY")
    api_key=ANTHROPIC_API_KEY,
)


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
            "description": item['description'] + " " + "1 indicates a perfect fit and 0 indicates no fit."
        }
    return api_criteria


def assessJobs(properties):
    url = 'http://hn.algolia.com/api/v1/items/36152014'
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        children_posts = data['children']
        print(children_posts)  # Prints the list of children posts
    else:
        print(f"Failed to fetch data. Status code: {response.status_code}")
        return

    jobs = children_posts[:20]

    props = {}
    propsNames = []
    results = []
    schema = map_frontend_to_api(properties)
    for job in jobs:
        try:
            prompt = f"{HUMAN_PROMPT} You're a helpful job search assistant, helping me cut through job postings that fit my criteria. You will be provided with a job description. Your task is to evaluate how well the job aligns with each of the specified filter criteria. The output should be a likelihood score ranging from 0 to 1 (where 0 indicates no fit, and 1 indicates a perfect fit), formatted in JSON. Please note that the score should not exceed 1. In situations where the job description doesn't contain any information related to a given criterion, assign a score of 0 to it. If the job only partly fits a specific criterion, use a lower number like 0.5 and not 1.0. Only respond in valid JSON format in this schema {schema}. List of Criteria: {properties}. Now, please analyze the following job posting and provide the scores: {job['descriptionCompleteText']}{AI_PROMPT}"

            completion = anthropic.completions.create(
                model="claude-2",
                max_tokens_to_sample=300,
                prompt=prompt,
            )

            print(completion.completion)
            json_match = re.search(r'\{.*\}', completion.completion, re.DOTALL)
            json_part = json_match.group()
            result_schema = json.loads(json_part)
            print(result_schema)
            # if sum(result_schema.values()) >= 3:
            results.append({"text": job["descriptionCompleteText"], "result": result_schema, "totalScore": sum(result_schema.values())})
        except Exception as e:
            logging.info(f"[get_answer_from_files] error: {e}")
            return str(e)
    with open('results.json', 'w') as json_file:
        json.dump(results, json_file)
    return jsonify({"results": results})
