import torch
from transformers import pipeline
# Check if GPU is available, and assign device accordingly
device = 0 if torch.cuda.is_available() else -1  # 0 indicates the first GPU, -1 for CPU

def chatlocal(values,instruction):
    # Load the pre-trained LLaMA model from the local directory
    pipe = pipeline(
        "text-generation", 
        model='./saved_llama_model',  # Local path to the LLaMA model
        torch_dtype=torch.bfloat16,  # Use bfloat16 for GPU, float32 for CPU
        device=device,  # Explicitly pass device argument
        pad_token_id=50256  # Set pad_token_id to avoid errors
    )
    prompt = f"<values>{values}</values>\n<instruction>{instruction}</instruction>"
    # Generate text with a lower temperature for controlled output
    messages = [
                    {"role": "system", "content": '''You are a data transformation expert focused on changing personally identifiable information (PII) to ensure privacy and security. Your primary task is to modify PII provided to you according to specific instructions. If no specific instructions are given, transform the data entirely while maintaining its contextual relevance. Your responses should:
                    Ensure that all transformed data is unrecognizable from the original PII while still resembling realistic alternatives.
                    Provide clear, concise transformations without unnecessary elaboration. 
                    The list of values is given in <values> tag and the instruction is given in the <instruction> tag.
                    Give just the list of new values only. No extra heading or tags also maintain the number of values. Avoid giving tags in output.
                    Tone of Voice: Professional, direct, and focused.'''},
                    {"role": "user", "content": prompt},
                ]
    outputs = pipe(
        messages,
        max_new_tokens=256,
    )
    # Return the generated text without additional prompt
    # print(outputs[0]["generated_text"][-1]["content"])
    return outputs[0]["generated_text"][-1]["content"].strip()
# # Example usage
# content = "Tomato,Tomato,RoyalBlue,Bisque,DarkBlue,Peru,PowderBlue,OliveDrab,Cyan,LightSeaGreen,Red,ForestGreen,DarkGreen,LightBlue,SeaGreen,Red,ForestGreen,LightSeaGreen,Red,ForestGreen,LightBlue,Red,ForestGreen,LightSeaGreen,Red,ForestGreen,LightBlue,Red,ForestGreen,LightSeaGreen,Red"
# result = chatlocal(content)
# print(result)
