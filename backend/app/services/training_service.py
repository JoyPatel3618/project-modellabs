import time

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from app.models.registry import ModelRegistry
from app.services.preprocessing_service import PreprocessingService


class TrainingService:

    @staticmethod
    def train_models(
        dataframe: pd.DataFrame,
        target: str,
        task: str,
        excluded_features: list[str] | None = None,
    ):

        if excluded_features is None:
            excluded_features = []

        X = dataframe.drop(columns=[target])
        y = dataframe[target]

        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=0.2,
            random_state=42,
            stratify=y if task == "classification" else None,
        )

        models = ModelRegistry.get_models(task)

        results = []

        for model_name, model in models.items():

            preprocessor = (
                PreprocessingService.build_pipeline(
                    dataframe,
                    target,
                    excluded_features,
                )
            )

            pipeline = Pipeline(
                steps=[
                    ("preprocessor", preprocessor),
                    ("model", model),
                ]
            )

            start_time = time.perf_counter()

            pipeline.fit(X_train, y_train)

            training_time = time.perf_counter() - start_time

            results.append({
                "model": model_name,
                "pipeline": pipeline,
                "X_train": X_train,
                "y_train": y_train,
                "X_test": X_test,
                "y_test": y_test,
                "training_time": round(
                    training_time,
                    4,
                ),
            })

        return results