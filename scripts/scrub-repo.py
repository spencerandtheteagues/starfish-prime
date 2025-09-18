
#!/usr/bin/env python3
import argparse, os, sys, json, re
from pathlib import Path

DEFAULT_FROM_PATTERNS = [
    # Titles / proper names
    r"\bOne[- ]Shot Multi[- ]Agent App\b",
    r"\bOne[- ]Shot App\b",
    r"\bOne[- ]Shot\b",
    # Slugs / tags
    r"\boneshot\b",
    r"\bone-shot\b",
    r"\bone_shot\b",
]

EXCLUDE_DIRS = {
    ".git", "node_modules", ".next", "dist", "build", ".cache", ".turbo",
    ".venv", "__pycache__", "coverage", ".idea", ".vscode", ".pnpm-store"
}

TEXT_EXTS = {
    ".js",".jsx",".ts",".tsx",".mjs",".cjs",".json",".md",".yml",".yaml",".sh",".env",".env.example",
    ".sql",".prisma",".css",".html",".txt",".ini",".conf",".Dockerfile",".gitignore",".gitattributes",
    ".graphql",".proto",".toml"
}

def to_slug(name: str) -> str:
    s = name.strip().lower()
    s = re.sub(r"[^a-z0-9]+","-", s).strip("-")
    return s or "app"

def is_text_file(p: Path) -> bool:
    if p.suffix in TEXT_EXTS or p.name in {"Dockerfile","Makefile"}:
        return True
    # heuristic: smallish files likely text
    try:
        data = p.read_bytes()[:1024]
        if b"\x00" in data:
            return False
        return True
    except Exception:
        return False

def replace_in_text(text: str, mappings):
    for pat, repl in mappings:
        text = re.sub(pat, repl, text, flags=re.IGNORECASE)
    return text

def main():
    ap = argparse.ArgumentParser(description="Repository scrubber / project rename")
    ap.add_argument("--to", required=True, help="New project name, e.g. 'Acme Rocket App'")
    ap.add_argument("--slug", default="", help="New slug (kebab-case). If omitted, derived from --to.")
    ap.add_argument("--dry-run", action="store_true", help="Show what would change, but do not modify files")
    args = ap.parse_args()

    new_name = args.to
    slug = args.slug or to_slug(new_name)

    # Build replacement mapping
    mappings = []
    # Friendly name replacements
    for pat in DEFAULT_FROM_PATTERNS:
        mappings.append( (pat, new_name) )
    # Slug replacements for oneshot/one-shot etc → slug
    mappings.append( (r"\boneshot\b", slug) )
    mappings.append( (r"\bone-shot\b", slug) )
    mappings.append( (r"\bone_shot\b", slug.replace("-", "_")) )

    changed = 0
    files = 0

    repo = Path(".").resolve()
    for root, dirs, fs in os.walk(repo):
        # prune exclude dirs
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for f in fs:
            p = Path(root) / f
            if not is_text_file(p):
                continue
            try:
                s = p.read_text(encoding="utf-8")
            except Exception:
                continue

            orig = s
            s2 = replace_in_text(s, mappings)

            # Special handling: package.json "name" field
            if p.name == "package.json":
                try:
                    j = json.loads(s2)
                    if isinstance(j, dict) and "name" in j and isinstance(j["name"], str):
                        # keep npm-safe name: slug if possible
                        j["name"] = slug if re.match(r"^[a-z0-9][a-z0-9-_]*$", slug) else re.sub(r"[^a-z0-9-_]","-", slug)
                        s2 = json.dumps(j, indent=2) + "\n"
                except Exception:
                    pass

            if s2 != orig:
                files += 1
                if not args.dry_run:
                    p.write_text(s2, encoding="utf-8")
                else:
                    print(f"[dry-run] would change: {p}")

    print(f"Scrub complete. Files changed: {files}")
    print(f"New project name: {new_name}")
    print(f"New slug: {slug}")

if __name__ == "__main__":
    main()
