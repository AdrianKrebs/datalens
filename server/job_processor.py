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


def calculate_cost(usage, model):
    cost_per_thousand_token = {
        "gpt-4": {
            "input": 0.03,
            "output": 0.06
        },
        "gpt-4-0613": {
            "input": 0.03,
            "output": 0.06
        },
        "gpt-3.5-turbo": {
            "input": 0.0015,
            "output": 0.002
        },
        "gpt-3.5-turbo-0613": {
            "input": 0.0015,
            "output": 0.002
        },
        "gpt-3.5-turbo-16k": {
            "input": 0.003,
            "output": 0.004
        }
    }

    cost = (usage['prompt_tokens'] / 1000 * cost_per_thousand_token[model]['input']) + \
           (usage['completion_tokens'] / 1000 * cost_per_thousand_token[model]['output'])

    return cost

# Handler for fetching data from HN
def fetch_HN_data(endpoint, headers=None):
    response = requests.get(endpoint)
    if response.status_code == 200:
        data = response.json()
        return data['children']
    else:
        print(f"Failed to fetch data from {endpoint}. Status code: {response.status_code}")
        return []

# Handler for another source (as an example)
def fetch_kadoa_data(endpoint, headers=None):
    response = requests.get(endpoint, headers=headers)
    # Adjust the parsing logic if needed
    jobs = []
    if response.status_code == 200:
        data = response.json()

        for entry in data:
            detail_data = entry["detailPageData"]
            job = {
                "id": detail_data["id"],
                "text": {
                    "title": detail_data.get("title"),
                    "location": detail_data.get("jobLocation"),
                    "description": detail_data["description"],
                    "url": detail_data["url"],
                }
            }
            jobs.append(job)
    else:
        print(f"Failed to fetch data from {endpoint}. Status code: {response.status_code}")

    return jobs


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


def calculate_relevance_score(results, criteria):
    weights = [2 if c['type'] == 'must' else 1 for c in criteria]
    individual_scores = [results[c['name'].replace(' ', '_').lower()] for c in criteria]
    relevance_score = sum(s * w for s, w in zip(individual_scores, weights)) / sum(weights)
    return relevance_score


def analyze_jobs(properties):
    # Load source configurations
    with open('sources_config.json', 'r') as config_file:
        sources = json.load(config_file)

    all_jobs = []
    for source in sources:
        handler_function = globals()[source["handler"]]
        headers = source.get("headers", {})
        jobs_from_source = handler_function(source["endpoint"], headers)
        all_jobs.extend(jobs_from_source)

    record_limit = os.getenv("RECORD_LIMIT")
    jobs = all_jobs[:int(record_limit)] if record_limit else all_jobs

    # Load previously analyzed jobs and criteria if the file exists
    try:
        with open('results.json', 'r') as json_file_results:
            previous_results = json.load(json_file_results)
        with open('criteria.json', 'r') as json_file_criteria:
            previous_criteria = json.load(json_file_criteria)
        previous_ids = [result["id"] for result in previous_results]
    except FileNotFoundError:
        previous_criteria = None
        previous_results = []
        previous_ids = []

        # Check if the criteria have changed
    criteria_changed = previous_criteria != properties

    results = previous_results.copy()
    schema = map_frontend_to_api(properties)
    for job in jobs:
        if not criteria_changed and job["id"] in previous_ids:
            continue
        try:
            res = use_openai(job, schema, properties)
            relevance_score = calculate_relevance_score(res, properties)

            results.append({"id": job["id"], "text": job["text"], "result": res,
                            "relevanceScore": relevance_score})
        except Exception as e:
            logging.info(f"[calling LLM] error: {e}")
            continue

    with open('results.json', 'w') as json_file_results:
        json.dump(results, json_file_results)
    with open('criteria.json', 'w') as json_file_criteria:
        json.dump(properties, json_file_criteria)
    return jsonify({"results": results})


def use_claude(job, schema, properties):
    prompt = f"{HUMAN_PROMPT} You're a helpful job search assistant, helping me cut through job postings that fit my criteria. You will be provided with a job description. Your task is to evaluate how well the job aligns with each of the specified filter criteria. The output should be a likelihood score ranging from 0 to 1 (where 0 indicates no fit, and 1 indicates a perfect fit), formatted in JSON. If a criterion is marked as \"must\" it has a higher importance and will weigh more in the total score. Please note that the score should not exceed 1. In situations where the job description doesn't contain any information related to a given criterion, assign a score of 0 to it. If the job only partly fits a specific criterion, use a lower number like 0.5 and not 1.0. Only respond in valid JSON format in this schema {schema}. List of Criteria: {properties}. Now, please analyze the following job posting and provide the scores: {job['text']}{AI_PROMPT}"

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
             "content": f"You will be provided with a job description. Your task is to evaluate how well the job aligns with each of the specified filter criteria. The output should be a likelihood score ranging from 0 to 1 (where 0 indicates no fit, and 1 indicates a perfect fit), formatted in JSON. Please note that the score should not exceed 1. In situations where the job description doesn't contain any information related to a given criterion, assign a score of 0 to it. If the job only partly fits a specific criterion, use a lower number like 0.5 and not 1.0.  If a criterion is marked as \"must\" it has a higher importance and will weigh more in the total score. For the remote and location criteria, assign a score of 1 if the job is based in the user's home country, if it's remote with no geographical restrictions, or if it's remote and allows workers from the user's home continent. Assign a score of 0 if the job is remote but restricted to a different country or continent. \n Here are the criteria to consider: {properties}. \n Now, please analyze the following job posting and provide the scores from 0 - 1: \n {job['text']} "}
        ],
        temperature=0.05,
        max_tokens=256,
        top_p=1,
        functions=[{"name": "classify_job", "parameters": schema}],
        function_call={"name": "classify_job"},
    )
    costs = calculate_cost(completion["usage"], OPENAI_API_MODEL)
    print(f"Costs: ${costs:.3f}")
    result_schema = json.loads(completion.choices[0].message.function_call.arguments)
    print(result_schema)
    return result_schema
