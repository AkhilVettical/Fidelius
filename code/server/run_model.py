from transformers import pipeline
import torch

# Check if GPU is available
device = 0 if torch.cuda.is_available() else -1  # Use GPU if available, otherwise fallback to CPU

# Load the pipeline from the saved directory
pipe = pipeline(
    "text-generation", 
    model='./saved_llama_model',  # Load from local path
    torch_dtype=torch.bfloat16, 
    device=device,  # Use GPU if available, otherwise CPU
    pad_token_id=50256  # Set this to the EOS token ID or another appropriate token
)

# Generate text with a specified number of new tokens
# output = pipe("You are a data masking assistant, remove the name in the sentence: Your name is john doe", max_new_tokens=150)  # Adjust token count as needed
# print(output)
