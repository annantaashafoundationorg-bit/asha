"""
AASHA AI TEAS — TLN Transformer Agent
Converts book chapters into structured TLN nodes.
"""

from .base_agent import BaseAgent, AgentContext


class TLNTransformerAgent(BaseAgent):
    name = "tln-transformer"
    description = "Converts book chapters into TLN nodes with concept summaries."

    def run(self, ctx: AgentContext) -> dict:
        book_title = ctx.inputs.get("book_title", "Untitled")
        chapters = ctx.inputs.get("chapters", [])
        grade = ctx.grade or ctx.inputs.get("grade")
        subject = ctx.subject or ctx.inputs.get("subject")

        nodes = []
        for idx, ch in enumerate(chapters, start=1):
            title = ch.get("title", f"Chapter {idx}")
            content = ch.get("content", "")
            nodes.append({
                "node_id": f"tln-{idx:03d}",
                "title": title,
                "concept": content[:200].strip(),
                "source_book": book_title,
                "grade": grade,
                "subject": subject,
                "dependencies": [f"tln-{idx-1:03d}"] if idx > 1 else [],
                "memory_tags": [
                    book_title.lower().replace(" ", "_"),
                    title.lower().replace(" ", "_"),
                ],
            })

        return {
            "book_title": book_title,
            "grade": grade,
            "subject": subject,
            "node_count": len(nodes),
            "nodes": nodes,
        }
