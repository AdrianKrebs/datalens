# Datalens

Datalens is a web app that lets you filter any data with LLMs.
LMs are really good at assessing unstructured data. This is an experiment to rank job postings by
relevance for the specified criteria, without having to go through countless filter options.
The current data source is the most recent "Who's Hiring" thread from Hacker News (more to come).
The current version is limited to job data, but future version will let you assess other data types like events, news,
or any other data.

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


