import pandas as pd


class ValidationService:

    @staticmethod
    def validate_target(
        dataframe: pd.DataFrame,
        target: str,
        task: str,
    ) -> dict:

        if target not in dataframe.columns:
            raise ValueError(
                f"Target column '{target}' does not exist."
            )

        target_series = dataframe[target]

        if target_series.isna().all():
            raise ValueError(
                f"Target column '{target}' contains only missing values."
            )

        unique_values = target_series.nunique()

        if task == "classification":
            if unique_values < 2:
                raise ValueError(
                    "Classification requires at least 2 classes."
                )

        elif task == "regression":
            if not pd.api.types.is_numeric_dtype(target_series):
                raise ValueError(
                    "Regression target must be numeric."
                )

        else:
            raise ValueError(
                f"Unsupported task: {task}"
            )

        return {
            "valid": True,
            "target": target,
            "task": task,
            "unique_values": int(unique_values),
            "missing_values": int(target_series.isna().sum()),
        }