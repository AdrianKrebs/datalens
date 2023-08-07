# Datalens

Datalens is a web app that lets you filter any data with LLMs. 
You can define any criteria and and input source, and the app will use an LLM model like GPT or Claude to surface the relevant data for your criteria.

The current version is limited to job data, but future version will let you assess other data types like events, news, or any other data.

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

## Powered by [Kadoa.com](https://kadoa.com)

