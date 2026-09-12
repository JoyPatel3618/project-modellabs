import os

import pandas as pd


class DatasetService:

    @staticmethod
    def save_upload(file_content: bytes, filename: str) -> str:
        if not filename.lower().endswith(".csv"):
            raise ValueError("Only CSV files are supported.")

        upload_dir = "storage/uploads"
        os.makedirs(upload_dir, exist_ok=True)

        file_path = os.path.join(upload_dir, filename)

        with open(file_path, "wb") as file:
            file.write(file_content)

        return file_path

    @staticmethod
    def load_csv(file_path: str) -> pd.DataFrame:
        try:
            dataframe = pd.read_csv(file_path)
        except Exception as exc:
            raise ValueError(f"Unable to read CSV: {exc}")

        if dataframe.empty:
            raise ValueError("The uploaded dataset is empty.")

        return dataframe