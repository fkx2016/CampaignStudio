from pydantic import BaseModel
from typing import Optional

class OptimizationRequest(BaseModel):
    text: str
    mode: str
    platform: str
    optimization_type: str # "shorten", "professional", "provocative", "cta"

class OptimizationResponse(BaseModel):
    optimized_text: str
    reasoning: str

# HARDCODED PROMPTS FOR MVP (Phase 1)
# In Phase 2, we will replace this with actual LLM calls
def simple_optimize(request: OptimizationRequest) -> OptimizationResponse:
    text = request.text
    opt_type = request.optimization_type
    
    if opt_type == "shorten":
        return OptimizationResponse(
            optimized_text=f"Shortened: {text[:50]}...",
            reasoning="Truncated text for brevity (MVP Logic)."
        )
    
    elif opt_type == "professional":
        return OptimizationResponse(
            optimized_text=f"Professionally speaking, {text}",
            reasoning="Added professional prefix (MVP Logic)."
        )
        
    elif opt_type == "provocative":
        return OptimizationResponse(
            optimized_text=f"Why aren't we talking about this? {text} 😤",
            reasoning="Added provocative hook and emoji (MVP Logic)."
        )
        
    elif opt_type == "cta":
        return OptimizationResponse(
            optimized_text=f"{text}\n\n👉 Link in bio!",
            reasoning="Appended generic Call to Action (MVP Logic)."
        )
        
    return OptimizationResponse(optimized_text=text, reasoning="No optimization applied.")
