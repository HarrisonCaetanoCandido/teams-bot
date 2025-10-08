from typing import List, Dict, Any
from models.tasks import Tasks


def treat_get_task_status(
    data: List[Dict[str, Any]], filter_strings: Tasks
) -> List[Dict[str, Any]]:
    if not data:
        return data

    filtered_data = data

    if filter_strings.userId != "all":
        filtered_data = [
            task
            for task in filtered_data
            if str(task.get("userId", "")).lower() == filter_strings.userId.lower()
        ]

    if filter_strings.id != "all":
        filtered_data = [
            task
            for task in filtered_data
            if str(task.get("id", "")).lower() == filter_strings.id.lower()
        ]

    if filter_strings.title != "all":
        filtered_data = [
            task
            for task in filtered_data
            if str(task.get("title", "")).lower() == filter_strings.title.lower()
        ]

    if filter_strings.completed != "all":
        filtered_data = [
            task
            for task in filtered_data
            if str(task.get("completed", "")).lower()
            == filter_strings.completed.lower()
        ]

    return filtered_data
