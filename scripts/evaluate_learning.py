"""
AASHA AI TEAS — CLI: evaluate a student's learning progress via the API.

Usage:
    python scripts/evaluate_learning.py --student S-1042
"""

import argparse
import httpx
import sys


def main():
    parser = argparse.ArgumentParser(description="Evaluate student learning progress.")
    parser.add_argument("--student", required=True, help="Student ID (e.g. S-1042)")
    parser.add_argument("--api", default="http://localhost:8000")
    args = parser.parse_args()

    try:
        analytics = httpx.get(
            f"{args.api}/api/analytics/student/{args.student}",
            timeout=15,
        )
        analytics.raise_for_status()
        a = analytics.json()

        rewards = httpx.get(
            f"{args.api}/api/rewards/{args.student}",
            timeout=15,
        )
        rewards.raise_for_status()
        r = rewards.json()

        print(f"\n── Student: {args.student} ──────────────────────")
        print(f"  Nodes completed:  {a['nodes_completed']}")
        print(f"  Average score:    {a['average_score']}")
        print(f"  Mastery tags:     {', '.join(a['mastery_tags']) or '—'}")
        print(f"  Weak tags:        {', '.join(a['weak_tags']) or '—'}")
        print(f"  Aasha Coins:      {r['aasha_coins']}")
        print(f"  XP:               {r['xp']}")
        print(f"  Level:            {r['level']}")
        print(f"  Badges:           {', '.join(r['badges']) or '—'}")
        print()

    except httpx.HTTPError as e:
        print(f"✗ API error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
