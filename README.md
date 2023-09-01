# Datalens: Automate Job Search with AI

## Overview

This is a personal experiment that uses LLMs to rank unstructured job data based on user-defined criteria. 
Traditional job search platforms rely on rigid filtering systems, but many users lack such concrete criteria.
Datalens lets you define your preferences in a more natural way and then rates each job postings based on the relevance.

Some criteria might be more important than others, so "must criteria" are weighted twice as much as normal ones.

![Datalens Preview](https://github.com/AdrianKrebs/datalens/blob/master/client/public/preview.png)

### Data Sources
You can add any job data source you like. 
I've pre-configured it based on my needs with the most recent "Who's Hiring" thread from Hacker News and the scraped career pages of Tesla, SpaceX, and Anduril.
I've used my own tool [Kadoa](https://kadoa.com) to fetch the job data from the company pages, but you can use any other traditional scraping method.

Add new job sources by updating sources_config.json. Example:
```
{
    "name": "SourceName",
    "endpoint": "API_ENDPOINT",
    "handler": "handler_function_name",
    "headers": {
        "x-api-key": "YOUR_API_KEY"
    }
}
```

## Model Choice
The relevance scoring works best with `gpt-4-0613` which returns granular scores between 0-1. `claude-2` works quite well too if you have access to it.
 `gpt-3.5-turbo-0613` can be used, but it often returns binary scores of 0 or 1 for criteria, lacking the nuance to distinguish between partial and full matches. 


## Cost Warning
Running this script continuously can result in high API usage so please use it responsibly. 
I'm logging the cost for each GPT call.



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

- Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.
- Define your ranking criteria
- Click Analyze

# Improvements
- Currently, the application fetches all analysis results in one long REST call, which can lead to long waiting times. We should switch to streaming/web sockets.
- The application is currently focused only on job data. We should make the system extensible to other types of data like events, products, etc.
