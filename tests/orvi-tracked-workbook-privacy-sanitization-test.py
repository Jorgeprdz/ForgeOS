#!/usr/bin/env python3
from pathlib import Path
from zipfile import ZipFile
import hashlib
import re
import sys
import xml.etree.ElementTree as ET

NS_MAIN = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
NS_REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
NS_PKG = "http://schemas.openxmlformats.org/package/2006/relationships"

PRIVATE_VALUE_SHA256 = "7d355947f5c61b87ef4d4dbf726c212f37eced3211680ac4b8c0ccef9958d433"
EXPECTED_SAFE_LABEL = "ORVI"

ALLOWED_TOP_LABELS = {
    "AHORRO ANUAL",
    "FONDO",
    "PROTECCION",
    "UDI",
    "UDIS",
    "DISPONIBLE",
    "PESOS",
    "TIEMPO",
    "AHORRO",
    "GANANCIA",
    "SUMA ASEGURADA POR FALLECIMIENTO",
    "SUMA ASEGURADA POR INVALIDEZ",
    "EXENCION DE PAGO DE PRIMAS",
    "-",
    EXPECTED_SAFE_LABEL,
}


def normalize_text(value):
    return " ".join(str(value or "").upper().split())


def normalize_target(target):
    if not target:
        return None
    if target.startswith("/"):
        return target.lstrip("/")
    if target.startswith("xl/"):
        return target
    return "xl/" + target.lstrip("/")


def load_workbook_candidate(repo_root):
    explicit = None
    if len(sys.argv) > 1:
        explicit = Path(sys.argv[1])
        if not explicit.is_absolute():
            explicit = repo_root / explicit
        if not explicit.is_file():
            raise AssertionError("explicit workbook does not exist")
        return explicit

    candidates = []
    for path in sorted(repo_root.glob("*.xls*")):
        if path.suffix.lower() not in {".xlsx", ".xlsm"}:
            continue
        try:
            with ZipFile(path) as archive:
                workbook_root = ET.fromstring(archive.read("xl/workbook.xml"))
                sheet_names = [
                    node.attrib.get("name", "")
                    for node in workbook_root.findall(f".//{{{NS_MAIN}}}sheet")
                ]
                if any(re.search(r"\borvi\b|orvi\s*99|ovri", name, re.I) for name in sheet_names):
                    candidates.append(path)
        except Exception:
            continue

    if len(candidates) != 1:
        raise AssertionError(f"expected exactly one ORVI workbook, found {len(candidates)}")
    return candidates[0]


def parse_workbook(path):
    with ZipFile(path) as archive:
        if archive.testzip() is not None:
            raise AssertionError("workbook ZIP integrity failed")

        names = set(archive.namelist())
        required = {
            "xl/workbook.xml",
            "xl/_rels/workbook.xml.rels",
            "xl/sharedStrings.xml",
        }
        if not required.issubset(names):
            raise AssertionError("workbook is missing required XML parts")

        workbook_root = ET.fromstring(archive.read("xl/workbook.xml"))
        rel_root = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        relation_map = {
            relation.attrib["Id"]: relation.attrib["Target"]
            for relation in rel_root.findall(f"{{{NS_PKG}}}Relationship")
        }

        sheets = []
        for sheet in workbook_root.findall(f".//{{{NS_MAIN}}}sheet"):
            name = sheet.attrib.get("name", "")
            relation_id = sheet.attrib.get(f"{{{NS_REL}}}id")
            target = normalize_target(relation_map.get(relation_id))
            sheets.append((name, target))

        orvi_sheets = [
            item for item in sheets
            if re.search(r"\borvi\b|orvi\s*99|ovri", item[0], re.I)
        ]
        if len(orvi_sheets) != 1:
            raise AssertionError(f"expected one ORVI sheet, found {len(orvi_sheets)}")

        _, sheet_path = orvi_sheets[0]
        if sheet_path not in names:
            raise AssertionError("ORVI sheet XML target is missing")

        shared_root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
        shared_items = shared_root.findall(f"{{{NS_MAIN}}}si")
        shared = [
            "".join(node.text or "" for node in item.iter(f"{{{NS_MAIN}}}t"))
            for item in shared_items
        ]

        private_hash_hits = [
            index
            for index, value in enumerate(shared)
            if hashlib.sha256(normalize_text(value).encode("utf-8")).hexdigest()
            == PRIVATE_VALUE_SHA256
        ]
        if private_hash_hits:
            raise AssertionError("private shared-string fingerprint still exists")

        sheet_root = ET.fromstring(archive.read(sheet_path))
        by_address = {
            cell.attrib.get("r", ""): cell
            for cell in sheet_root.findall(f".//{{{NS_MAIN}}}c")
        }

        def cell_value(cell):
            if cell is None:
                return None
            cell_type = cell.attrib.get("t")
            value_node = cell.find(f"{{{NS_MAIN}}}v")
            if cell_type == "s" and value_node is not None:
                index = int(value_node.text)
                return shared[index]
            if cell_type == "inlineStr":
                return "".join(
                    node.text or ""
                    for node in cell.iter(f"{{{NS_MAIN}}}t")
                )
            if value_node is not None:
                return value_node.text
            return None

        safe_header_value = normalize_text(cell_value(by_address.get("B2")))
        if safe_header_value != EXPECTED_SAFE_LABEL:
            raise AssertionError("ORVI header was not replaced by the safe label")

        merges = {
            node.attrib.get("ref", "")
            for node in sheet_root.findall(f".//{{{NS_MAIN}}}mergeCell")
        }
        if "B2:B3" not in merges:
            raise AssertionError("expected merged ORVI header range is missing")

        formula_count = 0
        formula_refs_to_header = []
        timeline_candidate_rows = 0
        top_unclassified = []

        for cell in sheet_root.findall(f".//{{{NS_MAIN}}}c"):
            formula_node = cell.find(f"{{{NS_MAIN}}}f")
            formula = (formula_node.text or "").strip() if formula_node is not None else ""
            if formula:
                formula_count += 1
                if re.search(r"(?<![A-Z0-9_])\$?B\$?2(?!\d)", formula, re.I):
                    formula_refs_to_header.append(cell.attrib.get("r", ""))

            address = cell.attrib.get("r", "")
            match = re.fullmatch(r"([A-Z]+)(\d+)", address)
            if not match or int(match.group(2)) > 3:
                continue
            if formula_node is not None:
                continue

            value = cell_value(cell)
            if value is None:
                continue

            try:
                float(str(value).strip())
                continue
            except Exception:
                pass

            normalized = normalize_text(value)
            if normalized not in ALLOWED_TOP_LABELS:
                top_unclassified.append(address)

        if formula_refs_to_header:
            raise AssertionError("sanitized header is unexpectedly referenced by formulas")
        if top_unclassified:
            raise AssertionError(
                f"unclassified top-region text remains at {top_unclassified}"
            )

        for row_number in range(1, 500):
            cell_a = by_address.get(f"A{row_number}")
            cell_b = by_address.get(f"B{row_number}")
            if cell_a is None or cell_b is None:
                continue
            try:
                value_a = float(cell_value(cell_a))
                value_b = float(cell_value(cell_b))
            except Exception:
                continue
            if 0 < value_a < 200 and 0 < value_b <= 130:
                timeline_candidate_rows += 1

        if formula_count != 64:
            raise AssertionError(f"formula count changed: {formula_count}")
        if timeline_candidate_rows != 46:
            raise AssertionError(
                f"timeline candidate row count changed: {timeline_candidate_rows}"
            )

        return {
            "formulaCount": formula_count,
            "timelineRows": timeline_candidate_rows,
            "topUnclassified": len(top_unclassified),
            "privateFingerprintHits": len(private_hash_hits),
            "safeHeader": safe_header_value,
        }


def main():
    repo_root = Path.cwd()
    workbook = load_workbook_candidate(repo_root)
    result = parse_workbook(workbook)
    print("PASS R15B1 ORVI tracked workbook privacy sanitization", result)


if __name__ == "__main__":
    main()
