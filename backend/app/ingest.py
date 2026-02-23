import os

EXCLUDED_FILES = {"qa_input_examples.txt"}

def load_documents(folder_path: str):
    documents = []

    for file in os.listdir(folder_path):
        if file.endswith(".txt") and file not in EXCLUDED_FILES:
            with open(os.path.join(folder_path, file), "r", encoding="utf-8") as f:
                text = f.read()
                documents.append({
                    "text": text,
                    "source": file
                })

    return documents
