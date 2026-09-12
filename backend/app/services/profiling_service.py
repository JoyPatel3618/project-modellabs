import pandas as pd

class ProfilingService:
    @staticmethod
    def profile(dataframe: pd.DataFrame) -> dict:

        numeric_columns = dataframe.select_dtypes(
            include=["number"]
        ).columns.tolist()

        categorical_columns = dataframe.select_dtypes(
            include=["object", "category", "bool"]
        ).columns.tolist()
        column_details = {}
        for column in dataframe.columns:
            column_details[column] = {
                "dtype": str(dataframe[column].dtype),
                "missing": int(dataframe[column].isna().sum()),
                "unique": int(dataframe[column].nunique()),
            }
        return{
            "rows": int(dataframe.shape[0]),
            "columns": int(dataframe.shape[1]),
            "column_names": dataframe.columns.tolist(),
            "numeric_columns": numeric_columns,
            "categorical_columns": categorical_columns,
            "missing_values": int(dataframe.isna().sum().sum()),
            "duplicate_rows": int(dataframe.duplicated().sum()),
            "column_details": column_details,
        }