from fastapi import FastAPI
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
import os
from typing import Optional, Literal
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]
SPREADSHEET_ID = "1pAOA-08klajkKqtufhUKdsDg2XskcWWKJQOUGaawec0"
creds = Credentials.from_service_account_file(
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"], scopes=SCOPES
)

service = build("sheets", "v4", credentials=creds)


def get_sheet_data(sheet_name: str):
    range_name = f"{sheet_name}!A1:Z"

    result = (
        service.spreadsheets()
        .values()
        .get(spreadsheetId=SPREADSHEET_ID, range=range_name)
        .execute()
    )

    rows = result.get("values", [])

    if not rows:
        return []

    headers = rows[0]
    data = rows[1:]

    return [dict(zip(headers, row)) for row in data]


"""
@app.route("/")
def home():
    return "Hello from backend!"
"""


@app.get("/books")
def get_books(
    source: Optional[Literal["owned", "wishlist"]] = None,
    read: Optional[Literal["Read", "Not Read", "N/A"]] = None,
):
    owned_books = get_sheet_data("Bookshelf")
    wishlist_books = get_sheet_data("Want to Buy")

    for book in owned_books:
        book["Source"] = "owned"

    for book in wishlist_books:
        book["Source"] = "wishlist"

    all_books = owned_books + wishlist_books

    if source:
        all_books = [book for book in all_books if book.get("Source") == source]

    if read:
        all_books = [book for book in all_books if book.get("Read") == read]

    return all_books


@app.get("/books/owned")
def get_owned_books(read: Optional[Literal["Read", "Not Read", "N/A"]] = None):
    return get_books(source="owned", read=read)


@app.get("/books/wishlist")
def get_wishlist_books():
    return get_books(source="wishlist")


@app.get("/books/read")
def get_read_books():
    return get_books(read="Read")


@app.get("/books/stats")
def get_book_stats(
    source: Optional[Literal["owned", "wishlist"]] = None,
    read: Optional[Literal["Read", "Not Read", "N/A"]] = None,
):
    books = get_books(source=source, read=read)

    total_books = len(books)

    number_read = sum(1 for book in books if book.get("Read") == "Read")

    percentage_read = (number_read / total_books) * 100 if total_books > 0 else 0

    author_counts = {}
    genre_counts = {}

    for book in books:
        author = book.get("Author") or "Unknown"
        if not isinstance(author, str):
            author = "Unknown"
        author = author.strip()

        genre = book.get("Genre") or "Unknown"

        author_counts[author] = author_counts.get(author, 0) + 1
        genre_counts[genre] = genre_counts.get(genre, 0) + 1

    return {
        "total_books": total_books,
        "number_read": number_read,
        "percentage_read": round(percentage_read, 2),
        "author_counts": author_counts,
        "genre_counts": genre_counts,
    }
