from typing import Dict, Any, List
from models.users import UserModel


def treat_list_users(
    data: List[Dict[str, Any]], filter_strings: UserModel
) -> List[Dict[str, Any]]:
    """
    Aplica TODOS os filtros localmente nos dados recebidos da api
    """
    if not data:
        return data

    filtered_data = data

    if filter_strings.department != "all":
        filtered_data = [
            user
            for user in filtered_data
            if user.get("company", {}).get("name", "").lower()
            == filter_strings.department.lower()
        ]

    if filter_strings.name != "all":
        filtered_data = [
            user
            for user in filtered_data
            if filter_strings.name.lower() in user.get("name", "").lower()
        ]

    if filter_strings.username != "all":
        filtered_data = [
            user
            for user in filtered_data
            if filter_strings.username.lower() in user.get("username", "").lower()
        ]

    if filter_strings.email != "all":
        filtered_data = [
            user
            for user in filtered_data
            if filter_strings.email.lower() in user.get("email", "").lower()
        ]

    if filter_strings.address.city != "all":
        filtered_data = [
            user
            for user in filtered_data
            if filter_strings.address.city.lower()
            in user.get("address", {}).get("city", "").lower()
        ]

    if filter_strings.address.street != "all":
        filtered_data = [
            user
            for user in filtered_data
            if filter_strings.address.street.lower()
            in user.get("address", {}).get("street", "").lower()
        ]

    if filter_strings.address.suite != "all":
        filtered_data = [
            user
            for user in filtered_data
            if filter_strings.address.suite.lower()
            in user.get("address", {}).get("suite", "").lower()
        ]

    if filter_strings.address.zipcode != "all":
        filtered_data = [
            user
            for user in filtered_data
            if filter_strings.address.zipcode
            in user.get("address", {}).get("zipcode", "")
        ]

    if filter_strings.phone != "all":
        filtered_data = [
            user
            for user in filtered_data
            if filter_strings.phone in user.get("phone", "")
        ]

    if filter_strings.website != "all":
        filtered_data = [
            user
            for user in filtered_data
            if filter_strings.website.lower() in user.get("website", "").lower()
        ]

    if filter_strings.company.name != "all":
        filtered_data = [
            user
            for user in filtered_data
            if filter_strings.company.name.lower()
            in user.get("company", {}).get("name", "").lower()
        ]

    if filter_strings.company.catchPhrase != "all":
        filtered_data = [
            user
            for user in filtered_data
            if filter_strings.company.catchPhrase.lower()
            in user.get("company", {}).get("catchPhrase", "").lower()
        ]

    if filter_strings.company.bs != "all":
        filtered_data = [
            user
            for user in filtered_data
            if filter_strings.company.bs.lower()
            in user.get("company", {}).get("bs", "").lower()
        ]

    status_filter = filter_strings.__dict__.get("filter", "all")
    if status_filter != "all":
        if status_filter == "active":
            filtered_data = [
                user for user in filtered_data if user.get("id", 0) % 2 == 0
            ]
        elif status_filter == "inactive":
            filtered_data = [
                user for user in filtered_data if user.get("id", 0) % 2 != 0
            ]

    return filtered_data
