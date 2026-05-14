import os
from bs4 import BeautifulSoup

# List of HTML files to clean
folders = [
    "finance", "reporting-analyst", "fund-accounting",
    "data-science", "fintech", "investment", "developer"
]
selectors = [
    ('.name', False), ('.job', False), ('.about p', False),
    ('.contact .call span', False), ('.contact .address span', False),
    ('.contact .Email span', False), ('.contact .website-text', False),
    ('.skills-grid', True), ('.edu ul', True), ('.work ul', True),
    ('.project-list', True), ('.interests-items', True),
    ('.language span', False), ('.project-description', False),
    ('.project-title', False), ('.project-category', False)
]

for folder in folders:
    html_path = os.path.join(folder, "index.html")
    if not os.path.exists(html_path):
        continue
    with open(html_path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")

    for selector, clear_html in selectors:
        for el in soup.select(selector):
            if clear_html:
                el.clear()
            else:
                el.string = ""

    # Optionally clear all <h6 class="coursework">
    for el in soup.select("h6.coursework"):
        el.string = ""

    with open(html_path, "w", encoding="utf-8") as f:
        f.write(str(soup))

print("Static CV data cleaned from all HTML files.")