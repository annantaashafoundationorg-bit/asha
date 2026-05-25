import asyncio
import os
import json
import logging
from typing import Dict, Any
import httpx
from PIL import Image

import google.generativeai as genai
from ..schemas import BookUploadRequest, ChapterInput
from .tln_service import generate_tln_nodes, save_book_and_nodes

logger = logging.getLogger("telegram_service")
logging.basicConfig(level=logging.INFO)

TELEGRAM_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
API_URL = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}"

# In-memory session state for user conversations
# chat_id -> { "state": "AWAITING_FILE" | "AWAITING_METADATA", "file_path": str, "file_name": str }
chat_states: Dict[int, Dict[str, Any]] = {}

async def send_telegram_message(chat_id: int, text: str) -> None:
    if not TELEGRAM_TOKEN:
        logger.warning("Telegram Bot Token is missing.")
        return
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{API_URL}/sendMessage",
                json={"chat_id": chat_id, "text": text, "parse_mode": "Markdown"}
            )
            response.raise_for_status()
        except Exception as e:
            logger.error(f"Failed to send Telegram message: {e}")

async def download_telegram_file(file_id: str, dest_path: str) -> bool:
    if not TELEGRAM_TOKEN:
        return False
    
    async with httpx.AsyncClient() as client:
        try:
            # 1. Get file path
            info_response = await client.get(f"{API_URL}/getFile?file_id={file_id}")
            info_response.raise_for_status()
            file_path = info_response.json()["result"]["file_path"]
            
            # 2. Download file
            download_url = f"https://api.telegram.org/file/bot{TELEGRAM_TOKEN}/{file_path}"
            file_response = await client.get(download_url)
            file_response.raise_for_status()
            
            os.makedirs(os.path.dirname(dest_path), exist_ok=True)
            with open(dest_path, "wb") as f:
                f.write(file_response.content)
            
            logger.info(f"Downloaded file to {dest_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to download Telegram file: {e}")
            return False

async def parse_and_generate_tln_from_file(file_path: str, metadata: dict) -> dict:
    """
    Parses the PDF/Image using Gemini 2.5 Pro or Flash depending on complexity.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set.")
    
    genai.configure(api_key=api_key)
    
    is_complex = metadata.get("complex", False)
    # Use Gemini 2.5 Pro for Math / Complex books, and Gemini 2.5 Flash for standard text
    model_name = "gemini-2.5-pro" if is_complex else "gemini-2.5-flash"
    model = genai.GenerativeModel(model_name)
    
    # Upload to Gemini Files API
    logger.info(f"Uploading {file_path} to Gemini Files API using model {model_name}...")
    gemini_file = genai.upload_file(path=file_path)
    
    prompt = f"""
    You are an AI educational parser. Parse this document to extract chapters and their concepts.
    
    The book details are:
    Title: {metadata.get('title')}
    Subject: {metadata.get('subject')}
    Grade: {metadata.get('grade')}
    Language: {metadata.get('language', 'en')}
    
    Extract the main concepts and structure them into a valid JSON object matching this structure:
    {{
      "chapters": [
        {{
          "chapter_id": "ch1",
          "title": "<Chapter Title>",
          "content": "<Detailed conceptual summary of the chapter contents, formulas, and diagrams>"
        }}
      ]
    }}
    
    Make sure to extract formula definitions and math expressions in LaTeX format if this is a mathematics/physics book.
    Respond ONLY with the JSON block. Do not include markdown wrappers (like ```json).
    """
    
    try:
        response = model.generate_content([gemini_file, prompt])
        text = response.text.strip()
        
        # Clean markdown code blocks if any
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        
        parsed_chapters = json.loads(text.strip())
        
        # Convert to TLN nodes
        nodes = generate_tln_nodes(
            book_title=metadata.get('title'),
            chapters=[ChapterInput(**ch) for ch in parsed_chapters.get("chapters", [])],
            grade=metadata.get('grade'),
            subject=metadata.get('subject'),
            language=metadata.get('language', 'en')
        )
        
        # Persist to database
        save_book_and_nodes(
            book_title=metadata.get('title'),
            grade=metadata.get('grade'),
            subject=metadata.get('subject'),
            language=metadata.get('language', 'en'),
            nodes=nodes
        )
        
        # Clean up file in Gemini system
        try:
            genai.delete_file(gemini_file.name)
        except Exception:
            pass
            
        return {
            "book_title": metadata.get('title'),
            "grade": metadata.get('grade'),
            "subject": metadata.get('subject'),
            "node_count": len(nodes),
            "nodes": [n.dict() for n in nodes]
        }
        
    except Exception as e:
        logger.error(f"Failed parsing document via Gemini: {e}")
        raise e

async def handle_telegram_message(message: dict) -> None:
    chat_id = message["chat"]["id"]
    text = message.get("text", "").strip()
    
    # Handle /help command
    if text == "/help":
        await send_telegram_message(
            chat_id,
            "📖 *Aasha AI Book Ingestion Bot Help*\n\n"
            "This bot ingests textbook chapters (PDFs/Images) and transforms them into structured Transformative Learning Nodes (TLN).\n\n"
            "💬 *Commands:*\n"
            "• `/start` or `/reset` - Start/reset the ingestion session\n"
            "• `/help` - Show this help message\n\n"
            "🚀 *How to Ingest:*\n"
            "1️⃣ *Single-Step Upload (Recommended)*:\n"
            "Upload your PDF/Image and set the *Caption* using the format:\n"
            "`Title | Subject | Grade | Language [| complex]`\n"
            "_Example:_\n"
            "`Class 8 Math | Mathematics | 8 | en | complex`\n\n"
            "2️⃣ *Two-Step Upload*:\n"
            "Just send the file. The bot will download it and prompt you to send the metadata details afterwards.\n\n"
            "⚠️ *File Limit*: Telegram restricts bot downloads to *20MB*. For larger files, please compress them or upload them via the Web Dashboard."
        )
        return

    # Handle /start or reset command
    if text == "/start" or text == "/reset":
        chat_states[chat_id] = {"state": "AWAITING_FILE"}
        await send_telegram_message(
            chat_id,
            "📚 *Aasha AI Book Ingestion Bot*\n\n"
            "Please upload a PDF document or an Image of the textbook chapter.\n\n"
            "💡 *Tip*: You can add details in the caption (e.g. `Class 8 Math | Mathematics | 8 | en`) to process in one step! Type `/help` for details."
        )
        return

    state = chat_states.get(chat_id, {}).get("state", "AWAITING_FILE")

    # 1. Handle File Upload
    if state == "AWAITING_FILE":
        document = message.get("document")
        photo = message.get("photo")
        caption = message.get("caption", "").strip()
        
        file_id = None
        file_name = None
        file_size = 0
        
        if document:
            file_id = document["file_id"]
            file_name = document.get("file_name", "book.pdf")
            file_size = document.get("file_size", 0)
        elif photo:
            # Get largest photo size
            file_id = photo[-1]["file_id"]
            file_name = "page.jpg"
            file_size = photo[-1].get("file_size", 0)
            
        if not file_id:
            await send_telegram_message(chat_id, "⚠️ Please send a PDF document or an image file.")
            return
            
        # Check Telegram 20MB limit
        if file_size > 20 * 1024 * 1024:
            size_mb = file_size / (1024 * 1024)
            await send_telegram_message(
                chat_id,
                f"⚠️ *File is too large!* ({size_mb:.1f} MB)\n\n"
                "Telegram's standard bot API limits downloads to *20 MB*. "
                "Please compress your file or upload it directly through the Aasha AI Web Dashboard:\n"
                "http://localhost:3000/dashboard"
            )
            return
        
        await send_telegram_message(chat_id, "📥 Downloading your document...")
        
        dest_path = f"./data/uploads/{chat_id}_{file_name}"
        success = await download_telegram_file(file_id, dest_path)
        
        if success:
            # Try to extract metadata from caption
            metadata = {}
            if caption:
                parts = [p.strip() for p in caption.split("|")]
                if len(parts) >= 3:
                    metadata = {
                        "title": parts[0],
                        "subject": parts[1],
                        "grade": parts[2],
                        "language": parts[3] if len(parts) > 3 else "en",
                        "complex": len(parts) > 4 and parts[4].lower() == "complex"
                    }
                elif len(parts) > 0 and parts[0] != "":
                    is_math = "math" in parts[0].lower() or "physics" in parts[0].lower()
                    metadata = {
                        "title": parts[0],
                        "subject": "Mathematics" if is_math else "General",
                        "grade": "General",
                        "language": "en",
                        "complex": is_math
                    }
            
            if metadata:
                # Single-step flow: process immediately
                metadata["complex"] = metadata.get("complex", False) or metadata.get("subject", "").lower() in ["math", "mathematics"]
                chat_states[chat_id] = {
                    "state": "PROCESSING",
                    "file_path": dest_path,
                    "file_name": file_name
                }
                await send_telegram_message(
                    chat_id,
                    f"🔄 *Parsing document (Single-step Ingest)...*\n"
                    f"📖 *Title*: {metadata['title']}\n"
                    f"📚 *Subject*: {metadata['subject']}\n"
                    f"🎓 *Grade*: {metadata['grade']}\n"
                    f"🌐 *Language*: {metadata['language']}\n"
                    f"⚡ *Mode*: {'Gemini 2.5 Pro (Complex)' if metadata['complex'] else 'Gemini 2.5 Flash (Standard)'}\n\n"
                    f"Please wait, transforming textbook content into TLN nodes..."
                )
                try:
                    result = await parse_and_generate_tln_from_file(dest_path, metadata)
                    chat_states[chat_id] = {"state": "AWAITING_FILE"}
                    if os.path.exists(dest_path):
                        os.remove(dest_path)
                        
                    node_titles = "\n".join([f"• {n['title']}" for n in result["nodes"]])
                    await send_telegram_message(
                        chat_id,
                        f"🎉 *Success! Ingestion Complete!*\n\n"
                        f"📖 *Book*: {result['book_title']} ({result['node_count']} nodes)\n\n"
                        f"*Generated TLN Nodes:*\n{node_titles}\n\n"
                        f"🔗 View on dashboard: http://localhost:3000/dashboard"
                    )
                except Exception as e:
                    chat_states[chat_id] = {
                        "state": "AWAITING_METADATA",
                        "file_path": dest_path,
                        "file_name": file_name
                    }
                    await send_telegram_message(
                        chat_id,
                        f"❌ *Parsing Error:*\n{str(e)}\n\n"
                        f"Please submit metadata to try again, or send `/reset` to start over."
                    )
            else:
                # Two-step flow: wait for metadata
                chat_states[chat_id] = {
                    "state": "AWAITING_METADATA",
                    "file_path": dest_path,
                    "file_name": file_name
                }
                await send_telegram_message(
                    chat_id,
                    "✅ File received!\n\n"
                    "Please enter the book details in this format:\n"
                    "`Book Title | Subject | Grade | Language`\n\n"
                    "_Example:_\n"
                    "`Class 8 Mathematics | Mathematics | 8 | en`\n\n"
                    "💡 *For complex Math/Science books*, append `| complex` at the end:\n"
                    "`Higher Physics | Physics | 11 | en | complex`"
                )
        else:
            await send_telegram_message(chat_id, "❌ Failed to download file. Please try again.")

    # 2. Handle Metadata Input
    elif state == "AWAITING_METADATA":
        if not text:
            await send_telegram_message(chat_id, "⚠️ Please provide the metadata in the correct format.")
            return
            
        parts = [p.strip() for p in text.split("|")]
        if len(parts) < 3:
            # Fallback if they just type a title without pipes
            title = text
            is_math = "math" in title.lower() or "physics" in title.lower()
            metadata = {
                "title": title,
                "subject": "Mathematics" if is_math else "General",
                "grade": "General",
                "language": "en",
                "complex": is_math
            }
        else:
            title = parts[0]
            subject = parts[1]
            grade = parts[2]
            language = parts[3] if len(parts) > 3 else "en"
            complex_flag = len(parts) > 4 and parts[4].lower() == "complex"
            metadata = {
                "title": title,
                "subject": subject,
                "grade": grade,
                "language": language,
                "complex": complex_flag or subject.lower() in ["math", "mathematics"]
            }
        
        file_path = chat_states[chat_id]["file_path"]
        chat_states[chat_id]["state"] = "PROCESSING"
        
        await send_telegram_message(
            chat_id,
            f"🔄 *Parsing document...*\n"
            f"📖 *Title*: {metadata['title']}\n"
            f"📚 *Subject*: {metadata['subject']}\n"
            f"🎓 *Grade*: {metadata['grade']}\n"
            f"🌐 *Language*: {metadata['language']}\n"
            f"⚡ *Mode*: {'Gemini 2.5 Pro (Complex)' if metadata['complex'] else 'Gemini 2.5 Flash (Standard)'}\n\n"
            f"Please wait, transforming textbook content into TLN nodes..."
        )
        
        try:
            # Perform Gemini Parsing
            result = await parse_and_generate_tln_from_file(file_path, metadata)
            
            # Reset state
            chat_states[chat_id] = {"state": "AWAITING_FILE"}
            
            # Delete local file after parsing
            if os.path.exists(file_path):
                os.remove(file_path)
                
            node_titles = "\n".join([f"• {n['title']}" for n in result["nodes"]])
            await send_telegram_message(
                chat_id,
                f"🎉 *Success! Ingestion Complete!*\n\n"
                f"📖 *Book*: {result['book_title']} ({result['node_count']} nodes)\n\n"
                f"*Generated TLN Nodes:*\n{node_titles}\n\n"
                f"🔗 View on dashboard: http://localhost:3000/dashboard"
            )
            
        except Exception as e:
            chat_states[chat_id]["state"] = "AWAITING_METADATA" # Let them retry or check
            await send_telegram_message(
                chat_id,
                f"❌ *Parsing Error:*\n{str(e)}\n\n"
                f"Please verify your file and try re-submitting metadata, or send `/reset` to start over."
            )

async def telegram_polling_loop() -> None:
    if not TELEGRAM_TOKEN:
        logger.warning("TELEGRAM_BOT_TOKEN environment variable not set. Telegram Bot is disabled.")
        return
        
    logger.info("Starting Telegram Bot updates polling loop...")
    offset = 0
    
    async with httpx.AsyncClient() as client:
        while True:
            try:
                response = await client.get(
                    f"{API_URL}/getUpdates?offset={offset}&timeout=30",
                    timeout=35.0
                )
                if response.status_code == 200:
                    updates = response.json().get("result", [])
                    for update in updates:
                        offset = update["update_id"] + 1
                        if "message" in update:
                            await handle_telegram_message(update["message"])
            except httpx.RequestError as e:
                logger.warning(f"Telegram polling request error: {e}")
                await asyncio.sleep(5)
            except Exception as e:
                logger.error(f"Error in Telegram bot loop: {e}")
                await asyncio.sleep(5)
