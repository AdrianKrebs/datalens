import openai
import logging
import sys
import time

from config import *

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("debug.log"),
        logging.StreamHandler(sys.stdout)
    ]
)


def get_pinecone_id_for_file_chunk(session_id, filename, chunk_index):
    return str(session_id + "-!" + filename + "-!" + str(chunk_index))


def get_pinecone_id_for_youtube_chunk(session_id, filename, timestamp_start):
    return str(session_id + "-!" + filename + "-!" + str(timestamp_start))

def get_embedding(text, engine):
    return openai.Embedding.create(model=engine, input=[text])["data"][0]["embedding"]


def get_embeddings(text_array, engine):
    # Parameters for exponential backoff
    max_retries = 5  # Maximum number of retries
    base_delay = 1  # Base delay in seconds
    factor = 2  # Factor to multiply the delay by after each retry
    while True:
        try:
            return openai.Embedding.create(input=text_array, model=engine)["data"]
        except Exception as e:
            if max_retries > 0:
                logging.info(f"Request failed. Retrying in {base_delay} seconds.")
                time.sleep(base_delay)
                max_retries -= 1
                base_delay *= factor
            else:
                raise e
