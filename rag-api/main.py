from fastapi import FastAPI
from datetime import datetime
from models.users import (
    ParseCommandRequest,
    UserModel,
    AddressModel,
    GeoModel,
    CompanyModel,
)
from models.tasks import Tasks
import requests
from service.treat_list_users import treat_list_users
from service.get_applied_filters import get_applied_filters
from service.treat_get_task_status import treat_get_task_status
from dotenv import load_dotenv
import os

load_dotenv()

webhook_api_url = os.getenv("WEBHOOK_API_URL")

# note que fastapi roda em ipv4
app = FastAPI()


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "RAG API"}


@app.post("/ai/parse-command")
async def parseCommand(request: ParseCommandRequest):
    print(
        f"📨 Mensagem recebida: '{request.message}' do usuário: '{request.user_id}' de conversa '{request.conversation_id}' e de origem: '{request.service_url}'"
    )

    # simulacao de predicao
    rag_response = {
        "intent": "execute-flow",  # Intenção detectada
        "confidence": 0.92,  # Confiança da predição de 0-1
        "parameters": {
            "department": "all",
            "name": "all",
            "username": "all",
            "email": "all",
            "address": {
                "street": "all",
                "suite": "all",
                "city": "all",
                "zipcode": "all",
                "geo": {"lat": "all", "lng": "all"},
            },
            "phone": "all",
            "website": "all",
            "company": {"name": "all", "catchPhrase": "all", "bs": "all"},
            "userId": "1",
            "id": "all",
            "title": "all",
            "completed": "false",
            "filter": "active",  # Parâmetro adicional para status
        },
        "original_message": request.message,
        "timestamp": datetime.now().isoformat(),
        "user_id": request.user_id,
        "execute_flow": {
            "flowName": "import-users",  # Nome do fluxo a ser executado
            "parameters": {  # Parâmetros específicos do fluxo
                "department": "financeiro",
                "syncMode": "full",
            },
            "initiatedBy": request.user_id,
            "correlationId": "req-abc-123",  # ID para rastreamento
            "conversationId": request.conversation_id,
            "serviceUrl": request.service_url,
        },
    }

    whook_response = None
    whook_data = None
    filter_strings = None

    # -------------------------- LIST USERS --------------------------

    if rag_response["intent"] == "list-users":
        try:
            filter_strings = UserModel(
                department=rag_response["parameters"].get("department", "all"),
                name=rag_response["parameters"].get("name", "all"),
                username=rag_response["parameters"].get("username", "all"),
                email=rag_response["parameters"].get("email", "all"),
                address=AddressModel(
                    street=rag_response["parameters"]
                    .get("address", {})
                    .get("street", "all"),
                    suite=rag_response["parameters"]
                    .get("address", {})
                    .get("suite", "all"),
                    city=rag_response["parameters"]
                    .get("address", {})
                    .get("city", "all"),
                    zipcode=rag_response["parameters"]
                    .get("address", {})
                    .get("zipcode", "all"),
                    geo=GeoModel(
                        lat=rag_response["parameters"]
                        .get("address", {})
                        .get("geo", {})
                        .get("lat", "all"),
                        lng=rag_response["parameters"]
                        .get("address", {})
                        .get("geo", {})
                        .get("lng", "all"),
                    ),
                ),
                phone=rag_response["parameters"].get("phone", "all"),
                website=rag_response["parameters"].get("website", "all"),
                company=CompanyModel(
                    name=rag_response["parameters"]
                    .get("company", {})
                    .get("name", "all"),
                    catchPhrase=rag_response["parameters"]
                    .get("company", {})
                    .get("catchPhrase", "all"),
                    bs=rag_response["parameters"].get("company", {}).get("bs", "all"),
                ),
            )

            whook_response = requests.get(f"{webhook_api_url}/api/commands/list-users")
            print("Webhook api status code response: ", whook_response.status_code)

            if whook_response.status_code == 200:
                whook_data = whook_response.json()

                if "data" in whook_data:
                    filtered_users = treat_list_users(
                        whook_data["data"], filter_strings
                    )

                    # Prepara resposta com metadados de filtragem
                    whook_data = {
                        "users": filtered_users,
                        "metadata": {
                            "total_original": len(whook_data["data"]),
                            "total_filtered": len(filtered_users),
                            "filters_applied": get_applied_filters(filter_strings),
                            "rag_parameters": rag_response["parameters"],
                        },
                    }

                print("Data filtered from list-users endpoint: ", whook_data)
            else:
                print(f"Webhook API returned error: {whook_response.status_code}")

        except Exception as e:
            print(f"Could not fetch data from Webhook api: {e}")
            if whook_response:
                print(f"Status code: {whook_response.status_code}")

    # -------------------------- GET TASK STATUS --------------------------

    elif rag_response["intent"] == "get-task-status":
        try:
            filter_strings = Tasks(
                userId=rag_response["parameters"].get("userId", "all"),
                id=rag_response["parameters"].get("id", "all"),
                title=rag_response["parameters"].get("title", "all"),
                completed=rag_response["parameters"].get("completed", "all"),
            )

            whook_response = requests.get(
                f"{webhook_api_url}/api/commands/get-task-status"
            )
            print("Webhook api status code response: ", whook_response.status_code)

            if whook_response.status_code == 200:
                whook_data = whook_response.json()

                if "data" in whook_data:
                    filtered_tasks = treat_get_task_status(
                        whook_data["data"], filter_strings
                    )

                    whook_data = {
                        "tasks": filtered_tasks,
                        "metadata": {
                            "total_original": len(whook_data["data"]),
                            "total_filtered": len(filtered_tasks),
                            "filters_applied": get_applied_filters(filter_strings),
                        },
                    }

                print("Data received from get-task-status endpoint: ", whook_data)
            else:
                print(f"Webhook API returned error: {whook_response.status_code}")

        except Exception as e:
            print(f"Could not fetch data from Webhook api: {e}")
            if whook_response:
                print(f"Status code: {whook_response.status_code}")

    # -------------------------- EXECUTE FLOW --------------------------

    elif rag_response["intent"] == "execute-flow":
        try:
            payload = {
                "flowName": rag_response["execute_flow"]["flowName"],
                "parameters": rag_response["execute_flow"]["parameters"],
                "initiatedBy": rag_response["execute_flow"]["initiatedBy"],
                "correlationId": rag_response["execute_flow"]["correlationId"],
                "conversationId": rag_response["execute_flow"]["conversationId"],
                "serviceUrl": rag_response["execute_flow"]["serviceUrl"],
            }

            whook_response = requests.post(
                f"{webhook_api_url}/api/commands/execute-flow", json=payload, timeout=15
            )
            print("Webhook api status code response: ", whook_response.status_code)

            if whook_response.status_code == 200:
                whook_data = whook_response.json()
                print("Data received from execute-flow endpoint: ", whook_data)
            else:
                print(f"Webhook API returned error: {whook_response.status_code}")

        except Exception as e:
            print(f"Could not fetch data from Webhook api: {e}")
            if whook_response:
                print(f"Status code: {whook_response.status_code}")

    else:
        whook_data = {
            "error": f"Intent não reconhecido: {rag_response['intent']}",
            "available_intents": ["list-users", "get-task-status", "execute-flow"],
            "received_parameters": rag_response["parameters"],
        }

    return {
        "success": whook_response.status_code == 200 if whook_response else False,
        "response": whook_data,
        "rag_intent": rag_response["intent"],
        "rag_parameters": rag_response["parameters"],
        "rag_confidence": rag_response["confidence"],
        "message": (
            "Comando processado com sucesso"
            if whook_response and whook_response.status_code == 200
            else "Erro no processamento do comando"
        ),
    }
