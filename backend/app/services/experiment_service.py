import pandas as pd

from app.services.evaluation_service import EvaluationService
from app.services.training_service import TrainingService
from app.services.validation_service import ValidationService
from app.services.feature_service import FeatureService
from app.services.optimization_service import (
    OptimizationService,
)


class ExperimentService:

    @staticmethod
    def run(
        dataframe: pd.DataFrame,
        task: str,
        target: str,
        objective: str,
    ):

        # 1. Validate target
        validation = ValidationService.validate_target(
            dataframe,
            target,
            task,
        )

        feature_analysis = FeatureService.analyze(
            dataframe,
            target,
        )

        excluded_features = (
            FeatureService.get_excluded_features(
                feature_analysis
            )
        )

        # 2. Train candidate models
        training_results = TrainingService.train_models(
            dataframe,
            target,
            task,
            excluded_features,
        )

        evaluated_models = []

        # 3. Evaluate each model
        for result in training_results:

            if task == "classification":
                metrics = (
                    EvaluationService.evaluate_classification(
                        result["pipeline"],
                        result["X_test"],
                        result["y_test"],
                    )
                )

            elif task == "regression":
                metrics = (
                    EvaluationService.evaluate_regression(
                        result["pipeline"],
                        result["X_test"],
                        result["y_test"],
                    )
                )

            else:
                raise ValueError(
                    f"Unsupported task: {task}"
                )

            # Only JSON-safe information goes into
            # the API response.
            evaluated_models.append({
                "model": result["model"],
                "metrics": metrics,
                "training_time": result["training_time"],
            })

        # 4. Select best baseline model
        if objective == "f1":
            best = max(
                evaluated_models,
                key=lambda x: x["metrics"]["f1"],
            )
        elif objective == "accuracy":
            best = max(
                evaluated_models,
                key=lambda x: x["metrics"]["accuracy"],
            )
        elif objective == "r2":
            best = max(
                evaluated_models,
                key=lambda x: x["metrics"]["r2"],
            )
        elif objective == "mae":
            best = min(
                evaluated_models,
                key=lambda x: x["metrics"]["mae"],
            )
        else:
            raise ValueError(
                f"Unsupported objective: {objective}"
            )

        # 5. Get the full training result
        # for the selected baseline model
        best_training_result = next(
            result
            for result in training_results
            if result["model"] == best["model"]
        )
        # 6. Optimize the selected model
        optimization_result = None
        optimized_metrics = None
        if task == "classification" and objective == "f1":
            optimization_result = (
                OptimizationService.optimize_classification(
                    dataframe=dataframe,
                    target=target,
                    model_name=best["model"],
                    X_train=best_training_result["X_train"],
                    y_train=best_training_result["y_train"],
                    excluded_features=excluded_features,
                    n_trials=10,
                )
            )
            # 7. Build model using Optuna's
            # best hyperparameters
            optimized_pipeline = (
                OptimizationService.build_optimized_pipeline(
                    dataframe=dataframe,
                    target=target,
                    model_name=best["model"],
                    best_params=optimization_result["best_params"],
                    excluded_features=excluded_features,
                )
            )

            # 8. Train optimized model only
            # on the training set
            optimized_pipeline.fit(
                best_training_result["X_train"],
                best_training_result["y_train"],
            )
            # 9. Evaluate on untouched test set
            optimized_metrics = (
                EvaluationService.evaluate_classification(
                    optimized_pipeline,
                    best_training_result["X_test"],
                    best_training_result["y_test"],
                )
            )

        optimization_result = None
        optimized_metrics = None
        final_model = best

        if task == "classification" and objective == "f1":

            best_training_result = next(
                result
                for result in training_results
                if result["model"] == best["model"]
            )

            optimization_result = (
                OptimizationService.optimize_classification(
                    dataframe=dataframe,
                    target=target,
                    model_name=best["model"],
                    X_train=best_training_result["X_train"],
                    y_train=best_training_result["y_train"],
                    excluded_features=excluded_features,
                    n_trials=10,
                )
            )

            optimized_pipeline = (
                OptimizationService.build_optimized_pipeline(
                    dataframe=dataframe,
                    target=target,
                    model_name=best["model"],
                    best_params=optimization_result["best_params"],
                    excluded_features=excluded_features,
                )
            )

            optimized_pipeline.fit(
                best_training_result["X_train"],
                best_training_result["y_train"],
            )

            optimized_metrics = (
                EvaluationService.evaluate_classification(
                    optimized_pipeline,
                    best_training_result["X_test"],
                    best_training_result["y_test"],
                )
            )

            if optimized_metrics["f1"] > best["metrics"]["f1"]:

                final_model = {
                    "model": best["model"],
                    "metrics": optimized_metrics,
                    "training_time": best["training_time"],
                }


        # 10. Return experiment results
        return {
            "validation": validation,
            "feature_analysis": feature_analysis,
            "excluded_features": excluded_features,
            "models": evaluated_models,
            "best_model": {
                "name": final_model["model"],
                "metrics": final_model["metrics"],
                "training_time": final_model["training_time"],
            },
            "optimization": (
                {
                    "baseline_model": best["model"],
                    "baseline_metrics": best["metrics"],
                    "best_parameters": (
                        optimization_result["best_params"]
                        if optimization_result
                        else None
                    ),
                    "cv_score": (
                        optimization_result["best_score"]
                        if optimization_result
                        else None
                    ),
                    "trials": (
                        optimization_result["trials"]
                        if optimization_result
                        else None
                    ),
                    "optimized_metrics": optimized_metrics,
                }
                if optimization_result is not None
                else None
            ),
        }