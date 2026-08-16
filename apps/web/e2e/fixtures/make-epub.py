#!/usr/bin/env python3
"""Build the reader's EPUB fixtures.

Two books, both hand-made rather than downloaded, and both committed next to this script so the
suite needs no network and no Python to run:

- `spike.epub` — long enough to paginate into several columns. A one-screen book would report "the
  page did not turn" for the wrong reason.
- `hostile.epub` — the same book with a first chapter that tries, four ways, to reach out of the
  frame it is rendered in: an inline script, an external script, an `onerror` handler and a form.
  It is not a hypothetical: on foliate-js's defaults all four succeeded, in three engines
  (docs/research/reader-sandbox-spike.md). It is the fixture that proves the walls are up.

The beacon host is the suite's own dev server (127.0.0.1:3100), so an escape that did happen would
arrive as a request the test can see rather than as a silent failure somewhere else.

Usage: python3 make-epub.py   →   spike.epub and hostile.epub next to this file
"""

import pathlib
import zipfile

HERE = pathlib.Path(__file__).parent

PARAGRAPH = (
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor "
    "incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud "
    "exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure "
    "dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
)


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


HOSTILE_SCRIPT = """
  try { fetch('http://127.0.0.1:3100/__beacon?via=inline-script'); } catch (e) {}
  try { parent.postMessage({ hostile: 'inline-script' }, '*'); } catch (e) {}
  try { top.postMessage({ hostile: 'inline-script-top' }, '*'); } catch (e) {}
  try { document.title = 'pwned'; } catch (e) {}
"""

HOSTILE_CHAPTER = """<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
  <head>
    <title>Hostile</title>
    <script type="text/javascript">%s</script>
    <script type="text/javascript" src="evil.js"></script>
  </head>
  <body>
    <h1>Hostile chapter</h1>
    <img src="x-does-not-exist.png" onerror="fetch('http://127.0.0.1:3100/__beacon?via=img-onerror')" alt="" />
    <form action="http://127.0.0.1:3100/__beacon?via=form" method="get"><input name="a" value="b" /></form>
%s
  </body>
</html>
"""

EVIL_JS = """
try { fetch('http://127.0.0.1:3100/__beacon?via=external-script'); } catch (e) {}
try { parent.postMessage({ hostile: 'external-script' }, '*'); } catch (e) {}
"""


def hostile_chapter(paragraphs: int = 40) -> str:
    body = "\n".join(f"    <p>H.{i + 1} {PARAGRAPH}</p>" for i in range(paragraphs))
    return HOSTILE_CHAPTER % (HOSTILE_SCRIPT, body)


def build(target: pathlib.Path, chapters: dict[str, str], extra: dict[str, str]) -> None:
    with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as epub:
        # The spec requires `mimetype` first and uncompressed; foliate's zip reader does not care,
        # but a fixture that is invalid in a way real readers reject would make a failure ambiguous.
        epub.writestr(zipfile.ZipInfo("mimetype"), "application/epub+zip", zipfile.ZIP_STORED)
        epub.writestr("META-INF/container.xml", CONTAINER)
        manifest_extra = "".join(
            f'    <item id="{name.replace(".", "-")}" href="{name}" '
            f'media-type="text/javascript"/>\n'
            for name in extra
        )
        epub.writestr("OEBPS/content.opf", OPF % manifest_extra)
        epub.writestr("OEBPS/nav.xhtml", NAV)
        for name, content in chapters.items():
            epub.writestr(f"OEBPS/{name}", content)
        for name, content in extra.items():
            epub.writestr(f"OEBPS/{name}", content)
    print(f"{target} ({target.stat().st_size} bytes)")


def main() -> None:
    build(
        HERE / "spike.epub",
        {f"ch{n}.xhtml": chapter(n) for n in (1, 2, 3)},
        {},
    )
    # The same book with its first chapter replaced by one that tries, four ways, to reach out of
    # the page it is rendered in. Whether those attempts land is the whole question of step 3.
    build(
        HERE / "hostile.epub",
        {"ch1.xhtml": hostile_chapter(), "ch2.xhtml": chapter(2), "ch3.xhtml": chapter(3)},
        {"evil.js": EVIL_JS},
    )


if __name__ == "__main__":
    main()
