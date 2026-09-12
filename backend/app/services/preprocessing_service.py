import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


class PreprocessingService:

    @staticmethod
    def build_pipeline(
        dataframe: pd.DataFrame,
        target: str,
        excluded_features: list[str] | None = None,
    ):

        if excluded_features is None:
            excluded_features = []

        X = dataframe.drop(columns=[target])

        included_columns = [
            column
            for column in X.columns
            if column not in excluded_features
        ]

        X = X[included_columns]

        numeric_columns = X.select_dtypes(
            include=["number"]
        ).columns.tolist()

        categorical_columns = X.select_dtypes(
            include=["object", "category", "bool"]
        ).columns.tolist()

        numeric_pipeline = Pipeline(
            steps=[
                (
                    "imputer",
                    SimpleImputer(strategy="median"),
                ),
                (
                    "scaler",
                    StandardScaler(),
                ),
            ]
        )

        categorical_pipeline = Pipeline(
            steps=[
                (
                    "imputer",
                    SimpleImputer(
                        strategy="most_frequent"
                    ),
                ),
                (
                    "encoder",
                    OneHotEncoder(
                        handle_unknown="ignore"
                    ),
                ),
            ]
        )

        preprocessor = ColumnTransformer(
            transformers=[
                (
                    "numeric",
                    numeric_pipeline,
                    numeric_columns,
                ),
                (
                    "categorical",
                    categorical_pipeline,
                    categorical_columns,
                ),
            ],
            remainder="drop",
        )

        return preprocessor