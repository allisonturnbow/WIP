from fastapi import FastAPI
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

app = FastAPI()

SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]
SPREADSHEET_ID = "1ou9CnVid6M1BSZuenY_6PhUBwo-KdxuN"
creds = Credentials.from_service_account_file(
    "service_account.json",
    scopes=SCOPES
)

service = build("sheets", "v4", credentials=creds)


def read_sheet(sheet_name: str):
    range_name = f"{sheet_name}!A1:Z"

    result = service.spreadsheets().values().get(
        spreadsheetId=SPREADSHEET_ID,
        range=range_name
    ).execute()

    rows = result.get("values", [])

    if not rows:
        return []

    headers = rows[0]
    data = rows[1:]

    return [
        dict(zip(headers, row))
        for row in data
    ]


@app.get("/books/owned")
def get_owned_books():
    return read_sheet("Bookshelf")


@app.get("/books/wishlist")
def get_wishlist():
    return read_sheet("Want to Buy")
