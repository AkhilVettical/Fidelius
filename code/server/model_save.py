import torch
import os
from transformers import pipeline
from huggingface_hub import login

# Load environment variables from the .env file in the parent directory
# load_dotenv('/project/variables.env')  # Adjust the path as necessary

# Get the Hugging Face API token from the environment variable
api_token = os.getenv("HUGGINFACE_API_KEY")
print(api_token)
# Authenticate with Hugging Face
login(token=api_token)

model_id = "meta-llama/Llama-3.2-3B-Instruct"

# Initialize the pipeline
pipe = pipeline(
    "text-generation",
    model=model_id,
    torch_dtype=torch.bfloat16,
    device_map="auto"
)

# Save the pipeline to a directory
pipe.save_pretrained('./saved_llama_model')
