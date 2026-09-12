from fastapi import (
    APIRouter,
    File,
    Form,
    HTTPException,
    UploadFile,
)

from app.services.dataset_service import DatasetService
from app.services.experiment_service import ExperimentService
from app.services.profiling_service import ProfilingService


router = APIRouter(
    prefix="/api/experiments",
    tags=["Experiments"],
)


@router.post("/analyze")
async def analyze_dataset(
    file: UploadFile = File(...),
    task: str = Form(...),
    target: str = Form(...),
    objective: str = Form(...),
):

    try:

        file_content = await file.read()

        file_path = DatasetService.save_upload(
            file_content,
            file.filename,
        )

        dataframe = DatasetService.load_csv(
            file_path
        )

        profile = ProfilingService.profile(
            dataframe
        )

        experiment = ExperimentService.run(
            dataframe=dataframe,
            task=task,
            target=target,
            objective=objective,
        )

        return {
            "filename": file.filename,
            "task": task,
            "target": target,
            "objective": objective,
            "profile": profile,
            "results": experiment,
        }

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )