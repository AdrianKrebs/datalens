from __future__ import print_function

import json
import os
import re

import requests

import openai
from anthropic import Anthropic, HUMAN_PROMPT, AI_PROMPT

import logging

from flask import jsonify

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

anthropic = Anthropic(
    # defaults to os.environ.get("ANTHROPIC_API_KEY")
    api_key=ANTHROPIC_API_KEY,
)

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


def calculate_total_score(results, criteria):
    weights = [2 if c['type'] == 'must' else 1 for c in criteria]
    individual_scores = [results[c['name'].replace(' ', '_').lower()] for c in criteria]
    total_score = sum(s * w for s, w in zip(individual_scores, weights)) / sum(weights)
    return total_score

def assessJobs(properties):
    url = 'http://hn.algolia.com/api/v1/items/36956867'
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        children_posts = data['children']
    else:
        print(f"Failed to fetch data. Status code: {response.status_code}")
        return

    jobs = children_posts[:50]

    # Load previously analyzed jobs if the file exists
    try:
        with open('criteria.json', 'r') as json_file_criteria:
            previous_criteria = json.load(json_file_criteria)
    except FileNotFoundError:
        previous_criteria = None

        # Check if the criteria have changed
    criteria_changed = previous_criteria != properties

    results = []
    schema = map_frontend_to_api(properties)
    for job in jobs:
        try:
            res = use_claude(job, schema, properties)
            total_score = calculate_total_score(res, properties)

            results.append({"id": job["id"], "text": job["text"], "result": res,
                            "totalScore": total_score})
        except Exception as e:
            logging.info(f"[calling LLM] error: {e}")
            continue


    with open('results.json', 'w') as json_file_results:
        json.dump(results, json_file_results)
    with open('criteria.json', 'w') as json_file_criteria:
        json.dump(properties, json_file_criteria)
    return jsonify({"results": results})


def use_claude(job, schema, properties):
    prompt = f"{HUMAN_PROMPT} You're a helpful job search assistant, helping me cut through job postings that fit my criteria. You will be provided with a job description. Your task is to evaluate how well the job aligns with each of the specified filter criteria. The output should be a likelihood score ranging from 0 to 1 (where 0 indicates no fit, and 1 indicates a perfect fit), formatted in JSON. Please note that the score should not exceed 1. In situations where the job description doesn't contain any information related to a given criterion, assign a score of 0 to it. If the job only partly fits a specific criterion, use a lower number like 0.5 and not 1.0. Only respond in valid JSON format in this schema {schema}. List of Criteria: {properties}. Now, please analyze the following job posting and provide the scores: {job['text']}{AI_PROMPT}"

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
    return result_schema


def use_openai(job, schema, properties):
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
    return result_schema
