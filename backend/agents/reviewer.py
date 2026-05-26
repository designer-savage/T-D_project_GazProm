_STOP_WORDS = {
    "в", "на", "и", "с", "по", "для", "из", "от", "к", "о", "у", "за",
    "не", "это", "как", "но", "а", "то", "так", "что", "он", "она", "они",
    "я", "мы", "вы", "или", "если", "при", "до", "без", "под", "над",
    "the", "a", "an", "is", "in", "of", "to", "and", "for", "with",
}

_MIN_WORDS = 30
_MIN_RAG_OVERLAP = 3


def review(response: str, rag_docs: list[dict]) -> tuple[bool, str]:
    """Эвристическая проверка качества ответа. Возвращает (ok, clarification_text)."""
    words = response.split()

    if len(words) < _MIN_WORDS:
        return False, "Похоже, мне не хватило информации для полного ответа. Попробуй переформулировать вопрос — например, уточни контекст или задай его иначе."

    if rag_docs:
        doc_words: set[str] = set()
        for doc in rag_docs:
            for w in doc.get("content", "").lower().split():
                clean = w.strip(".,!?;:\"'()")
                if clean and clean not in _STOP_WORDS and len(clean) > 3:
                    doc_words.add(clean)

        response_words = {
            w.strip(".,!?;:\"'()").lower()
            for w in words
            if len(w) > 3
        } - _STOP_WORDS

        overlap = doc_words & response_words
        if len(overlap) < _MIN_RAG_OVERLAP:
            return False, "Не нашёл точной информации в базе знаний по этой теме. Попробуй уточнить вопрос или спроси что-то конкретное — например, название курса или процесса."

    return True, ""
