from sklearn.ensemble import (
    GradientBoostingClassifier,
    GradientBoostingRegressor,
    RandomForestClassifier,
    RandomForestRegressor,
)
from sklearn.linear_model import (
    LinearRegression,
    LogisticRegression,
    Ridge,
)
from sklearn.neighbors import KNeighborsClassifier


class ModelRegistry:

    CLASSIFICATION_MODELS = {
        "logistic_regression": LogisticRegression(
            max_iter=1000
        ),
        "random_forest": RandomForestClassifier(
            n_estimators=200,
            random_state=42,
            n_jobs=-1,
        ),
        "gradient_boosting": GradientBoostingClassifier(
            random_state=42
        ),
        "knn": KNeighborsClassifier(),
    }

    REGRESSION_MODELS = {
        "linear_regression": LinearRegression(),
        "ridge": Ridge(),
        "random_forest": RandomForestRegressor(
            n_estimators=200,
            random_state=42,
            n_jobs=-1,
        ),
        "gradient_boosting": GradientBoostingRegressor(
            random_state=42
        ),
    }

    @classmethod
    def get_models(cls, task: str):

        if task == "classification":
            return cls.CLASSIFICATION_MODELS.copy()

        if task == "regression":
            return cls.REGRESSION_MODELS.copy()

        raise ValueError(
            f"Unsupported task: {task}"
        )