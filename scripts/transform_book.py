"""
AASHA AI TEAS — CLI: transform a book file into TLN nodes via the API.

Usage:
    python scripts/transform_book.py --file data/books/science_grade7.json
    python scripts/transform_book.py --file data/books/science_grade7.json --api http://localhost:8000
"""

import argparse
import json
import sys
import httpx


def main():
    parser = argparse.ArgumentParser(description="Transform a book into TLN nodes via AASHA AI API.")
    parser.add_argument("--file", required=True, help="Path to book JSON file")
    parser.add_argument("--api", default="http://localhost:8000", help="API base URL")
    args = parser.parse_args()

    with open(args.file) as f:
        book = json.load(f)

    print(f"Transforming: {book.get('title')} ({len(book.get('chapters', []))} chapters)")

    try:
        response = httpx.post(
            f"{args.api}/api/transform/book",
            json=book,
            timeout=30,
        )
        response.raise_for_status()
        result = response.json()
        print(f"✓ {result['node_count']} TLN nodes generated")
        for node in result["nodes"]:
            reuse = f" [assets: {', '.join(node['asset_ids'])}]" if node.get("asset_ids") else ""
            print(f"  {node['node_id']} — {node['title']}{reuse}")
    except httpx.HTTPError as e:
        print(f"✗ API error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
