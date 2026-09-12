import optuna

from sklearn.ensemble import (
    GradientBoostingClassifier,
    RandomForestClassifier,
)
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import (
    StratifiedKFold,
    cross_val_score,
)
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline

from app.services.preprocessing_service import (
    PreprocessingService,
)


class OptimizationService:

    @staticmethod
    def _build_model(
        trial,
        model_name,
    ):

        if model_name == "random_forest":

            return RandomForestClassifier(
                n_estimators=trial.suggest_int(
                    "n_estimators",
                    100,
                    500,
                    step=100,
                ),
                max_depth=trial.suggest_int(
                    "max_depth",
                    3,
                    20,
                ),
                min_samples_split=trial.suggest_int(
                    "min_samples_split",
                    2,
                    10,
                ),
                min_samples_leaf=trial.suggest_int(
                    "min_samples_leaf",
                    1,
                    5,
                ),
                max_features=trial.suggest_categorical(
                    "max_features",
                    ["sqrt", "log2"],
                ),
                random_state=42,
                n_jobs=-1,
            )

        if model_name == "gradient_boosting":

            return GradientBoostingClassifier(
                n_estimators=trial.suggest_int(
                    "n_estimators",
                    50,
                    300,
                    step=50,
                ),
                learning_rate=trial.suggest_float(
                    "learning_rate",
                    0.01,
                    0.3,
                    log=True,
                ),
                max_depth=trial.suggest_int(
                    "max_depth",
                    2,
                    8,
                ),
                min_samples_split=trial.suggest_int(
                    "min_samples_split",
                    2,
                    10,
                ),
                min_samples_leaf=trial.suggest_int(
                    "min_samples_leaf",
                    1,
                    5,
                ),
                random_state=42,
            )

        if model_name == "logistic_regression":

            return LogisticRegression(
                C=trial.suggest_float(
                    "C",
                    0.001,
                    10,
                    log=True,
                ),
                max_iter=1000,
            )

        if model_name == "knn":

            return KNeighborsClassifier(
                n_neighbors=trial.suggest_int(
                    "n_neighbors",
                    3,
                    15,
                ),
                weights=trial.suggest_categorical(
                    "weights",
                    ["uniform", "distance"],
                ),
                p=trial.suggest_int(
                    "p",
                    1,
                    2,
                ),
            )

        raise ValueError(
            f"Unsupported model: {model_name}"
        )

    @staticmethod
    def optimize_classification(
        dataframe,
        target,
        model_name,
        X_train,
        y_train,
        excluded_features=None,
        n_trials=10,
    ):

        if excluded_features is None:
            excluded_features = []

        cv = StratifiedKFold(
            n_splits=5,
            shuffle=True,
            random_state=42,
        )

        def objective(trial):

            model = (
                OptimizationService._build_model(
                    trial,
                    model_name,
                )
            )

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

            scores = cross_val_score(
                pipeline,
                X_train,
                y_train,
                cv=cv,
                scoring="f1_weighted",
                n_jobs=-1,
            )
            print("CV Scores:", scores)    
            print("HPO model:", model_name)
            print("X_train shape:", X_train.shape)
            print("y_train shape:", y_train.shape)


            return scores.mean()
        study = optuna.create_study(
            direction="maximize"
        )

        study.optimize(
            objective,
            n_trials=n_trials,
        )

        return {
            "model": model_name,
            "best_score": round(
                study.best_value,
                4,
            ),
            "best_params": study.best_params,
            "trials": len(study.trials),
        }

    @staticmethod
    def build_optimized_pipeline(
        dataframe,
        target,
        model_name,
        best_params,
        excluded_features=None,
    ):

        if excluded_features is None:
            excluded_features = []

        if model_name == "random_forest":

            model = RandomForestClassifier(
                **best_params,
                random_state=42,
                n_jobs=-1,
            )

        elif model_name == "gradient_boosting":

            model = GradientBoostingClassifier(
                **best_params,
                random_state=42,
            )

        elif model_name == "logistic_regression":

            model = LogisticRegression(
                **best_params,
                max_iter=1000,
            )

        elif model_name == "knn":

            model = KNeighborsClassifier(
                **best_params,
            )

        else:
            raise ValueError(
                f"Unsupported model: {model_name}"
            )

        preprocessor = (
            PreprocessingService.build_pipeline(
                dataframe,
                target,
                excluded_features,
            )
        )

        return Pipeline(
            steps=[
                ("preprocessor", preprocessor),
                ("model", model),
            ]
        )