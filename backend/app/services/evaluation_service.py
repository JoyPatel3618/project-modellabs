from sklearn.metrics import (
    accuracy_score,
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    precision_score,
    r2_score,
    recall_score,
)


class EvaluationService:

    @staticmethod
    def evaluate_classification(
        model,
        X_test,
        y_test,
    ):

        predictions = model.predict(X_test)

        return {
            "accuracy": round(
                accuracy_score(
                    y_test,
                    predictions,
                ),
                4,
            ),
            "precision": round(
                precision_score(
                    y_test,
                    predictions,
                    average="weighted",
                    zero_division=0,
                ),
                4,
            ),
            "recall": round(
                recall_score(
                    y_test,
                    predictions,
                    average="weighted",
                    zero_division=0,
                ),
                4,
            ),
            "f1": round(
                f1_score(
                    y_test,
                    predictions,
                    average="weighted",
                    zero_division=0,
                ),
                4,
            ),
        }

    @staticmethod
    def evaluate_regression(
        model,
        X_test,
        y_test,
    ):

        predictions = model.predict(X_test)

        mse = mean_squared_error(
            y_test,
            predictions,
        )

        return {
            "mae": round(
                mean_absolute_error(
                    y_test,
                    predictions,
                ),
                4,
            ),
            "mse": round(mse, 4),
            "rmse": round(mse ** 0.5, 4),
            "r2": round(
                r2_score(
                    y_test,
                    predictions,
                ),
                4,
            ),
        }