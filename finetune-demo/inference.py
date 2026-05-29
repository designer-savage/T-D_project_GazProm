"""
Сравнение ответов модели ДО и ПОСЛЕ файнтюнинга.

Запуск (после train.py):
    python inference.py
"""

import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel

MODEL_NAME = "gpt2"
ADAPTER_DIR = "./output/adapter"
MAX_NEW_TOKENS = 120

PROMPT = "### Вопрос: Что нужно для перехода с уровня Middle на Senior?\n### Ответ:"


def generate(model, tokenizer, prompt: str) -> str:
    inputs = tokenizer(prompt, return_tensors="pt")
    with torch.no_grad():
        output = model.generate(
            **inputs,
            max_new_tokens=MAX_NEW_TOKENS,
            do_sample=False,
            pad_token_id=tokenizer.eos_token_id,
        )
    generated = output[0][inputs["input_ids"].shape[1]:]
    return tokenizer.decode(generated, skip_special_tokens=True).strip()


# ---------------------------------------------------------------------------
# До файнтюнинга — базовый GPT-2
# ---------------------------------------------------------------------------

print("=" * 60)
print("  БАЗОВАЯ МОДЕЛЬ (без файнтюнинга)")
print("=" * 60)
print(f"Вопрос: {PROMPT}\n")

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
tokenizer.pad_token = tokenizer.eos_token
base_model = AutoModelForCausalLM.from_pretrained(MODEL_NAME)
base_model.eval()

before = generate(base_model, tokenizer, PROMPT)
print(f"Ответ:\n{before}")

# ---------------------------------------------------------------------------
# После файнтюнинга — GPT-2 + LoRA-адаптер
# ---------------------------------------------------------------------------

print("\n" + "=" * 60)
print("  МОДЕЛЬ ПОСЛЕ ФАЙНТЮНИНГА (LoRA-адаптер)")
print("=" * 60)
print(f"Вопрос: {PROMPT}\n")

finetuned_model = PeftModel.from_pretrained(base_model, ADAPTER_DIR)
finetuned_model.eval()

after = generate(finetuned_model, tokenizer, PROMPT)
print(f"Ответ:\n{after}")

print("\n" + "=" * 60)
print("  Адаптер обучен на корпоративных T&D Q&A парах.")
print("  В реальном проекте: модель Llama/Qwen + отраслевой датасет.")
print("=" * 60)
