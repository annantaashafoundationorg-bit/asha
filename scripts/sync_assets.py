"""
AASHA AI TEAS — CLI: sync asset registry and print summary.

Usage:
    python scripts/sync_assets.py
    python scripts/sync_assets.py --search "water cycle"
"""

import argparse
import httpx
import sys


def main():
    parser = argparse.ArgumentParser(description="Sync and query the AASHA AI asset registry.")
    parser.add_argument("--search", help="Search query")
    parser.add_argument("--api", default="http://localhost:8000")
    args = parser.parse_args()

    if args.search:
        try:
            response = httpx.post(
                f"{args.api}/api/assets/search",
                json={"query": args.search, "tags": []},
                timeout=15,
            )
            response.raise_for_status()
            data = response.json()
            print(f"Assets matching '{args.search}': {data['total']}")
            for asset in data["assets"]:
                source_icon = "↻" if asset["source"] == "reusable" else "✦"
                print(f"  {source_icon} [{asset['asset_id']}] {asset['title']} (score: {asset.get('score', '—')})")
        except httpx.HTTPError as e:
            print(f"✗ API error: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        print("Usage: python scripts/sync_assets.py --search <query>")


if __name__ == "__main__":
    main()
