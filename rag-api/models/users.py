from pydantic import BaseModel

# Pydantic models are simply classes which inherit from BaseModel and define fields as annotated attributes.


class ParseCommandRequest(BaseModel):
    message: str
    user_id: str = "unknown"
    conversation_id: str = "unknown"
    service_url: str = "unknown"


class GeoModel(BaseModel):
    lat: str = "all"
    lng: str = "all"


class AddressModel(BaseModel):
    street: str = "all"
    suite: str = "all"
    city: str = "all"
    zipcode: str = "all"
    geo: GeoModel = GeoModel()


class CompanyModel(BaseModel):
    name: str = "all"
    catchPhrase: str = "all"
    bs: str = "all"


class UserModel(BaseModel):
    department: str = "all"
    name: str = "all"
    username: str = "all"
    email: str = "all"
    address: AddressModel = AddressModel()
    phone: str = "all"
    website: str = "all"
    company: CompanyModel = CompanyModel()
