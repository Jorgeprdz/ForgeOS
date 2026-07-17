# Forge Project 200 Upload and Parser Decision 067G6

Status: `PARSER_IMPLEMENTED_NO_CROSS_DOMAIN_WRITE`. CSV and JSON are ratified because the repository has no canonical XLSX dependency; XLSX fails explicitly instead of being guessed. Every row retains an exact reference and becomes valid, invalid, incomplete, duplicate or quarantined. Normalization is logged, source rows are never silently lost, and valid output creates Project 200 Contact candidates only—not Prospects. Synthetic fixtures only. Next: 067G7.
