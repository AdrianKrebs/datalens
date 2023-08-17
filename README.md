# Datalens: A New Approach to Job Searching

## Overview

This is a personal experiment that uses LLMs to rank and rate unstructured job data based on user-defined criteria. 
Traditional job search platforms rely on rigid filtering systems, but many users lack such concrete criteria.
Datalens lets you define your preferences in a more natural way and then rates each job postings based on the relevance.

Some criteria might be more important than others, so "must criteria" are weighted twice as much as normal ones.

## Data Source and Extensibility
The current version is limited to job data and the only source is the most recent "Who's Hiring" thread from Hacker News .
Future version will let you add other sources and analyze other data types, such as events.


## Limitations
The relevance scoring works best with `gpt-4-0613` or `claude-2`. `gpt-3.5-turbo-0613` can be used, but the results are notably less relevant. 


## Cost Warning
Running this script continuously can result in high API usage so please use it responsibly. 
Processing 500 job postings with `gpt-4-0613` costs around $10.

![Datalens Preview](https://github.com/AdrianKrebs/datalens/blob/master/client/public/preview.png)

## Requirements

To run the app, you need:

- An OpenAI API or Anthropic Claude key.
- Python 3.7 or higher and pipenv for the Flask server.
- Node.js and npm for the Next.js client.

## Set-Up and Development

### Server

Copy the .env.example file and fill it out.

Run the Flask server:

```
cd server
cp .env.example .env
pip install -r requirements.txt
py main
```

### Client

Navigate to the client directory and install Node dependencies:

```
cd client
npm install
```

Run the Next.js client:

```
cd client
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

