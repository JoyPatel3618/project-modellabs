import pandas as pd


class FeatureService:

    @staticmethod
    def analyze(
        dataframe: pd.DataFrame,
        target: str,
    ) -> dict:

        features = dataframe.drop(columns=[target])

        analysis = {}

        for column in features.columns:

            series = features[column]

            missing_count = int(series.isna().sum())
            total_count = len(series)

            missing_ratio = (
                missing_count / total_count
                if total_count > 0
                else 0
            )

            unique_count = int(series.nunique())
            unique_ratio = (
                unique_count / total_count
                if total_count > 0
                else 0
            )

            dtype = str(series.dtype)

            role = "feature"
            action = "keep"
            reason = "Normal predictive feature."

            # 1. Identifier detection
            if unique_ratio >= 0.95:
                role = "identifier"
                action = "exclude"
                reason = (
                    "Almost every row has a unique value."
                )

            # 2. Extremely high missingness
            elif missing_ratio >= 0.50:
                role = "high_missing"
                action = "exclude"
                reason = (
                    f"{missing_ratio:.1%} of values are missing."
                )

            # 3. High-cardinality categorical feature
            elif (
                dtype in ["object", "category", "bool"]
                and unique_ratio >= 0.50
            ):
                role = "high_cardinality"
                action = "review"
                reason = (
                    "Categorical feature has very high "
                    "cardinality."
                )

            # 4. Constant feature
            elif unique_count <= 1:
                role = "constant"
                action = "exclude"
                reason = (
                    "Feature contains only one unique value."
                )

            # 5. Moderate missingness
            elif missing_ratio > 0:
                role = "missing_values"
                action = "keep"
                reason = (
                    f"{missing_ratio:.1%} of values are missing; "
                    "imputation recommended."
                )

            analysis[column] = {
                "dtype": dtype,
                "unique": unique_count,
                "unique_ratio": round(
                    unique_ratio,
                    4,
                ),
                "missing": missing_count,
                "missing_ratio": round(
                    missing_ratio,
                    4,
                ),
                "role": role,
                "action": action,
                "reason": reason,
            }

        return analysis

    @staticmethod
    def get_excluded_features(
        feature_analysis: dict,
    ) -> list[str]:

        return [
            column
            for column, details in feature_analysis.items()
            if details["action"] == "exclude"
        ]
