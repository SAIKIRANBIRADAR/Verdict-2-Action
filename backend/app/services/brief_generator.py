"""Executive brief PDF generator using ReportLab."""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import inch
from loguru import logger
from app.core.config import get_settings


PRIMARY = HexColor("#1F3D2B")
ACCENT = HexColor("#D4AF37")
CRITICAL = HexColor("#D32F2F")
IMPORTANT = HexColor("#F57C00")


def generate_executive_brief(case_data: dict, extracted: dict, action_plan: dict) -> str:
    """Generate a formatted executive brief PDF. Returns the file path."""
    settings = get_settings()
    os.makedirs(settings.GENERATED_DIR, exist_ok=True)

    filename = f"brief_{case_data.get('id', 'unknown')}.pdf"
    file_path = os.path.join(settings.GENERATED_DIR, filename)

    doc = SimpleDocTemplate(file_path, pagesize=A4, topMargin=0.75 * inch, bottomMargin=0.75 * inch)
    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle("BriefTitle", parent=styles["Title"], textColor=PRIMARY, fontSize=18, spaceAfter=12)
    heading_style = ParagraphStyle("BriefHeading", parent=styles["Heading2"], textColor=PRIMARY, fontSize=13, spaceAfter=6, spaceBefore=14)
    body_style = ParagraphStyle("BriefBody", parent=styles["Normal"], fontSize=10, leading=14, spaceAfter=4)
    directive_style = ParagraphStyle("Directive", parent=body_style, leftIndent=20, bulletIndent=10)

    elements = []

    # Title
    elements.append(Paragraph("EXECUTIVE BRIEF — VERDICT 2 ACTION", title_style))
    elements.append(Spacer(1, 8))

    # Case overview table
    case_info = [
        ["Case Number", case_data.get("case_number", "N/A")],
        ["Court", case_data.get("court", "N/A")],
        ["Department", case_data.get("department", "N/A")],
        ["Date", str(case_data.get("upload_date", "N/A"))],
        ["Priority", case_data.get("priority", "N/A")],
        ["Status", case_data.get("status", "N/A")],
    ]
    table = Table(case_info, colWidths=[2 * inch, 4 * inch])
    table.setStyle(TableStyle([
        ("TEXTCOLOR", (0, 0), (0, -1), PRIMARY),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("LINEBELOW", (0, -1), (-1, -1), 1, HexColor("#CCCCCC")),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 14))

    # Summary
    summary = extracted.get("ai_summary") or extracted.get("summary", "No summary available.")
    elements.append(Paragraph("Case Summary", heading_style))
    elements.append(Paragraph(summary, body_style))

    # Key Directives
    directives = extracted.get("key_directives") or extracted.get("directives", [])
    if directives:
        elements.append(Paragraph("Key Directives", heading_style))
        for d in directives:
            elements.append(Paragraph(f"• {d}", directive_style))

    # Deadlines
    deadlines = extracted.get("deadlines", [])
    if deadlines:
        elements.append(Paragraph("Deadlines", heading_style))
        for dl in deadlines:
            if isinstance(dl, dict):
                elements.append(Paragraph(f"• {dl.get('deadline', 'N/A')} — {dl.get('description', '')}", directive_style))

    # Action Plan
    if action_plan:
        elements.append(Paragraph("Recommended Action Plan", heading_style))
        elements.append(Paragraph(f"<b>Recommendation:</b> {action_plan.get('recommendation_type') or action_plan.get('recommendation', 'N/A')}", body_style))
        elements.append(Paragraph(f"<b>Department:</b> {action_plan.get('responsible_department', 'N/A')}", body_style))
        elements.append(Paragraph(f"<b>Risk Level:</b> {action_plan.get('risk_score', 'N/A')}", body_style))

        steps = action_plan.get("compliance_steps", [])
        if steps:
            elements.append(Paragraph("Compliance Steps:", body_style))
            for step in steps:
                elements.append(Paragraph(f"• {step}", directive_style))

        reasoning = action_plan.get("reasoning", "")
        if reasoning:
            elements.append(Paragraph("Reasoning:", body_style))
            elements.append(Paragraph(reasoning, body_style))

    # Build PDF
    try:
        doc.build(elements)
        logger.info(f"Executive brief generated: {file_path}")
    except Exception as e:
        logger.error(f"PDF generation failed: {e}")
        raise

    return file_path
