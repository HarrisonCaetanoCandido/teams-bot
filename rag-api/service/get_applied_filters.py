from models.users import UserModel
from typing import Dict, Any


def get_applied_filters(filter_strings: UserModel) -> Dict[str, Any]:
    """Retorna apenas os filtros que foram aplicados (diferentes de 'all')"""
    applied_filters = {}

    for field, value in filter_strings.__dict__.items():
        if field == "address" and value:

            for addr_field, addr_value in value.__dict__.items():
                if addr_field == "geo" and addr_value:

                    for geo_field, geo_value in addr_value.__dict__.items():
                        if geo_value != "all":
                            applied_filters[f"address.geo.{geo_field}"] = geo_value
                elif addr_value != "all":
                    applied_filters[f"address.{addr_field}"] = addr_value

        elif field == "company" and value:
            for comp_field, comp_value in value.__dict__.items():
                if comp_value != "all":
                    applied_filters[f"company.{comp_field}"] = comp_value
        elif value != "all":
            applied_filters[field] = value

    return applied_filters
