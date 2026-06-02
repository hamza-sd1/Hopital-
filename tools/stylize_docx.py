import copy
import hashlib
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"

ET.register_namespace("w", W)
ET.register_namespace("r", R)


def qn(tag):
    prefix, name = tag.split(":")
    return f"{{{W if prefix == 'w' else R}}}{name}"


def child(parent, tag):
    found = parent.find(qn(tag))
    if found is None:
        found = ET.SubElement(parent, qn(tag))
    return found


def set_val(el, value):
    el.set(qn("w:val"), str(value))


def remove_children(parent, names):
    wanted = {qn(name) for name in names}
    for item in list(parent):
        if item.tag in wanted:
            parent.remove(item)


def text_of(paragraph):
    return "".join(t.text or "" for t in paragraph.findall(f".//{{{W}}}t")).strip()


def set_paragraph_style(paragraph, style_id):
    ppr = child(paragraph, "w:pPr")
    pstyle = ppr.find(qn("w:pStyle"))
    if pstyle is None:
        pstyle = ET.Element(qn("w:pStyle"))
        ppr.insert(0, pstyle)
    set_val(pstyle, style_id)


def set_paragraph_props(paragraph, align=None, before=None, after=None, line=None, page_break_before=False):
    ppr = child(paragraph, "w:pPr")
    if align:
        jc = child(ppr, "w:jc")
        set_val(jc, align)
    spacing = child(ppr, "w:spacing")
    if before is not None:
        spacing.set(qn("w:before"), str(before))
    if after is not None:
        spacing.set(qn("w:after"), str(after))
    if line is not None:
        spacing.set(qn("w:line"), str(line))
        spacing.set(qn("w:lineRule"), "auto")
    if page_break_before:
        child(ppr, "w:pageBreakBefore")


def set_run_font(paragraph, font, size_half_points=None, bold=None, color=None):
    for run in paragraph.findall(qn("w:r")):
        rpr = child(run, "w:rPr")
        rfonts = child(rpr, "w:rFonts")
        rfonts.set(qn("w:ascii"), font)
        rfonts.set(qn("w:hAnsi"), font)
        rfonts.set(qn("w:cs"), font)
        if size_half_points:
            set_val(child(rpr, "w:sz"), size_half_points)
            set_val(child(rpr, "w:szCs"), size_half_points)
        if bold is not None:
            b = child(rpr, "w:b")
            b.set(qn("w:val"), "1" if bold else "0")
        if color:
            child(rpr, "w:color").set(qn("w:val"), color)


def style_run_defaults(paragraph):
    for run in paragraph.findall(qn("w:r")):
        rpr = child(run, "w:rPr")
        rfonts = child(rpr, "w:rFonts")
        rfonts.set(qn("w:ascii"), "Calibri")
        rfonts.set(qn("w:hAnsi"), "Calibri")
        rfonts.set(qn("w:cs"), "Calibri")
        set_val(child(rpr, "w:sz"), 22)
        set_val(child(rpr, "w:szCs"), 22)


def add_shading(paragraph, fill):
    ppr = child(paragraph, "w:pPr")
    shd = child(ppr, "w:shd")
    shd.set(qn("w:fill"), fill)
    shd.set(qn("w:val"), "clear")


def set_style(styles_root, style_id, name, style_type="paragraph", based_on=None, next_style=None, ui_priority=None):
    style = None
    for candidate in styles_root.findall(qn("w:style")):
        if candidate.get(qn("w:styleId")) == style_id:
            style = candidate
            break
    if style is None:
        style = ET.SubElement(styles_root, qn("w:style"))
        style.set(qn("w:type"), style_type)
        style.set(qn("w:styleId"), style_id)
    style.set(qn("w:type"), style_type)
    remove_children(style, ["w:name", "w:basedOn", "w:next", "w:uiPriority", "w:qFormat", "w:pPr", "w:rPr"])
    child(style, "w:name").set(qn("w:val"), name)
    if based_on:
        set_val(child(style, "w:basedOn"), based_on)
    if next_style:
        set_val(child(style, "w:next"), next_style)
    if ui_priority:
        set_val(child(style, "w:uiPriority"), ui_priority)
    child(style, "w:qFormat")
    return style


def configure_styles(styles_xml):
    styles_root = ET.fromstring(styles_xml)

    defaults = child(styles_root, "w:docDefaults")
    rpr_default = child(child(defaults, "w:rPrDefault"), "w:rPr")
    rfonts = child(rpr_default, "w:rFonts")
    rfonts.set(qn("w:ascii"), "Calibri")
    rfonts.set(qn("w:hAnsi"), "Calibri")
    rfonts.set(qn("w:cs"), "Calibri")
    set_val(child(rpr_default, "w:sz"), 22)
    set_val(child(rpr_default, "w:szCs"), 22)
    ppr_default = child(child(defaults, "w:pPrDefault"), "w:pPr")
    spacing = child(ppr_default, "w:spacing")
    spacing.set(qn("w:after"), "120")
    spacing.set(qn("w:line"), "276")
    spacing.set(qn("w:lineRule"), "auto")
    set_val(child(ppr_default, "w:jc"), "both")

    normal = set_style(styles_root, "Normal", "Normal", next_style="Normal", ui_priority="1")
    ppr = child(normal, "w:pPr")
    sp = child(ppr, "w:spacing")
    sp.set(qn("w:after"), "120")
    sp.set(qn("w:line"), "276")
    sp.set(qn("w:lineRule"), "auto")
    set_val(child(ppr, "w:jc"), "both")

    specs = {
        "ReportTitle": ("Titre rapport", 36, "17365D", True, "center", 220, 120),
        "ReportSubtitle": ("Sous-titre rapport", 26, "44546A", False, "center", 80, 80),
        "CoverMeta": ("Meta page de garde", 22, "1F2937", True, "center", 90, 20),
        "CoverName": ("Nom page de garde", 22, "374151", False, "center", 10, 10),
        "ReportHeading1": ("Titre 1 rapport", 30, "17365D", True, "left", 360, 180),
        "ReportHeading2": ("Titre 2 rapport", 24, "1F4E79", True, "left", 220, 100),
        "ReportHeading3": ("Titre 3 rapport", 22, "2F5F8F", True, "left", 160, 80),
        "TocEntry": ("Entree sommaire", 21, "374151", False, "left", 20, 20),
        "CodeBlock": ("Bloc code", 19, "111827", False, "left", 0, 0),
    }
    for style_id, (name, size, color, bold, align, before, after) in specs.items():
        style = set_style(styles_root, style_id, name, based_on="Normal", next_style="Normal", ui_priority="20")
        ppr = child(style, "w:pPr")
        set_val(child(ppr, "w:jc"), align)
        sp = child(ppr, "w:spacing")
        sp.set(qn("w:before"), str(before))
        sp.set(qn("w:after"), str(after))
        sp.set(qn("w:line"), "276")
        sp.set(qn("w:lineRule"), "auto")
        rpr = child(style, "w:rPr")
        rfonts = child(rpr, "w:rFonts")
        font = "Consolas" if style_id == "CodeBlock" else ("Cambria" if "Heading" in style_id or "Title" in style_id else "Calibri")
        rfonts.set(qn("w:ascii"), font)
        rfonts.set(qn("w:hAnsi"), font)
        rfonts.set(qn("w:cs"), font)
        set_val(child(rpr, "w:sz"), size)
        set_val(child(rpr, "w:szCs"), size)
        child(rpr, "w:color").set(qn("w:val"), color)
        if bold:
            child(rpr, "w:b")

    return ET.tostring(styles_root, encoding="utf-8", xml_declaration=True)


def is_codeish(text):
    if len(text) > 160:
        return False
    patterns = [
        r"^[{}()[\];,]+$",
        r"^\s*(import|from|def|class|return|if|else|elif|for|while|try|except|public|private|protected|function|const|let|var)\b",
        r"^\s*[$]?[a-zA-Z_][\w$]*\s*(=|->|=>|::)",
        r"^\s*(Schema::|Route::|DB::|<\?php|</?\w+|#|//)",
        r".*[{};]$",
    ]
    return any(re.search(pattern, text) for pattern in patterns)


def is_probable_subtitle(text):
    if len(text) > 78:
        return False
    if re.match(r"^\d+\.", text) or text.startswith(("•", "-", "–")):
        return False
    if text.endswith((".", ";", ",")):
        return False
    words = text.split()
    if len(words) > 9:
        return False
    lower_starters = {"de", "des", "du", "d'", "l'", "la", "le", "les", "un", "une", "et", "ou"}
    titled = sum(1 for w in words if w[:1].isupper() or w.lower() in lower_starters)
    return bool(words) and titled >= max(1, len(words) - 1)


def add_section_page_margins(section):
    pgmar = child(section, "w:pgMar")
    pgmar.set(qn("w:top"), "1440")
    pgmar.set(qn("w:right"), "1260")
    pgmar.set(qn("w:bottom"), "1440")
    pgmar.set(qn("w:left"), "1260")
    pgmar.set(qn("w:header"), "720")
    pgmar.set(qn("w:footer"), "720")
    pgmar.set(qn("w:gutter"), "0")


def style_table(table):
    tblpr = child(table, "w:tblPr")
    borders = child(tblpr, "w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        border = child(borders, f"w:{edge}")
        border.set(qn("w:val"), "single")
        border.set(qn("w:sz"), "6")
        border.set(qn("w:space"), "0")
        border.set(qn("w:color"), "D0D7DE")
    width = child(tblpr, "w:tblW")
    width.set(qn("w:w"), "5000")
    width.set(qn("w:type"), "pct")

    rows = table.findall(qn("w:tr"))
    for row_index, row in enumerate(rows):
        for cell in row.findall(qn("w:tc")):
            tcpr = child(cell, "w:tcPr")
            margins = child(tcpr, "w:tcMar")
            for side in ("top", "left", "bottom", "right"):
                mar = child(margins, f"w:{side}")
                mar.set(qn("w:w"), "90")
                mar.set(qn("w:type"), "dxa")
            if row_index == 0:
                shd = child(tcpr, "w:shd")
                shd.set(qn("w:fill"), "EAF2F8")
                shd.set(qn("w:val"), "clear")
            for paragraph in cell.findall(qn("w:p")):
                style_run_defaults(paragraph)
                if row_index == 0:
                    set_run_font(paragraph, "Calibri", 21, True, "17365D")


def style_document(document_xml):
    root = ET.fromstring(document_xml)
    body = root.find(qn("w:body"))
    paragraphs = [p for p in body.iter(qn("w:p"))]

    nonempty_index = 0
    in_toc = False
    seen_real_intro = False
    previous_heading_level = 0

    for p in paragraphs:
        text = text_of(p)
        if not text:
            continue
        nonempty_index += 1
        style_run_defaults(p)

        if nonempty_index == 1:
            set_paragraph_style(p, "ReportTitle")
            set_run_font(p, "Cambria", 32, True, "17365D")
            set_paragraph_props(p, align="center", before=280, after=40)
        elif nonempty_index == 3:
            set_paragraph_style(p, "ReportTitle")
            set_run_font(p, "Cambria", 38, True, "17365D")
            set_paragraph_props(p, align="center", before=360, after=160)
        elif 4 <= nonempty_index <= 6:
            set_paragraph_style(p, "ReportSubtitle")
            set_paragraph_props(p, align="center")
        elif 7 <= nonempty_index <= 20:
            set_paragraph_style(p, "CoverMeta" if text.endswith(":") or text.startswith(("Filière", "Organisme", "Période", "Année")) else "CoverName")
            set_paragraph_props(p, align="center", before=70, after=20)
        elif text == "3. Sommaire":
            in_toc = True
            set_paragraph_style(p, "ReportHeading1")
            set_paragraph_props(p, page_break_before=True)
            previous_heading_level = 1
        elif in_toc and text == "4. Introduction":
            in_toc = False
            seen_real_intro = True
            set_paragraph_style(p, "ReportHeading1")
            set_paragraph_props(p, page_break_before=True)
            previous_heading_level = 1
        elif in_toc:
            set_paragraph_style(p, "TocEntry")
            set_paragraph_props(p, before=0, after=20)
        elif re.match(r"^(?:[2-9]|1[0-5])\.\s+", text):
            set_paragraph_style(p, "ReportHeading1")
            set_paragraph_props(p, page_break_before=(nonempty_index > 24 and text not in {"2. Remerciements"}))
            previous_heading_level = 1
        elif is_codeish(text):
            set_paragraph_style(p, "CodeBlock")
            set_run_font(p, "Consolas", 19, False, "111827")
            set_paragraph_props(p, align="left", before=0, after=0, line=240)
            add_shading(p, "F6F8FA")
        elif is_probable_subtitle(text):
            level = 2 if previous_heading_level <= 1 else 3
            set_paragraph_style(p, "ReportHeading2" if level == 2 else "ReportHeading3")
            previous_heading_level = level
        else:
            set_paragraph_style(p, "Normal")
            set_paragraph_props(p, align="both", before=0, after=120, line=276)
            previous_heading_level = max(1, previous_heading_level)

    for table in root.findall(f".//{{{W}}}tbl"):
        style_table(table)

    for sect in root.findall(f".//{{{W}}}sectPr"):
        add_section_page_margins(sect)

    return ET.tostring(root, encoding="utf-8", xml_declaration=True)


def extract_text_hash(document_xml):
    root = ET.fromstring(document_xml)
    texts = ["".join(t.text or "" for t in p.findall(f".//{{{W}}}t")) for p in root.findall(f".//{{{W}}}p")]
    return hashlib.sha256("\n".join(texts).encode("utf-8")).hexdigest()


def main():
    if len(sys.argv) != 3:
        raise SystemExit("usage: stylize_docx.py input.docx output.docx")
    src = Path(sys.argv[1])
    dst = Path(sys.argv[2])

    with zipfile.ZipFile(src, "r") as zin:
        document_xml = zin.read("word/document.xml")
        original_hash = extract_text_hash(document_xml)
        new_document = style_document(document_xml)
        new_hash = extract_text_hash(new_document)
        if new_hash != original_hash:
            raise RuntimeError("Text changed while styling; refusing to write output.")

        with zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED) as zout:
            for item in zin.infolist():
                data = zin.read(item.filename)
                if item.filename == "word/document.xml":
                    data = new_document
                elif item.filename == "word/styles.xml":
                    data = configure_styles(data)
                zout.writestr(copy.copy(item), data)

    print(f"created: {dst}")
    print(f"text-hash: {original_hash}")


if __name__ == "__main__":
    main()
