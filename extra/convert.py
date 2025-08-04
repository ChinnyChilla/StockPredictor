import requests
from bs4 import BeautifulSoup
import json

# Step 1: Download the article
url = "https://www.cnbc.com/2025/06/09/trump-sued-national-guard-la-california-newsom.html"
headers = {"User-Agent": "Mozilla/5.0"}
response = requests.get(url, headers=headers)

# Step 2: Parse with BeautifulSoup
soup = BeautifulSoup(response.text, "html.parser")

# Step 3: Extract title and article text
title = soup.find("h1").get_text(strip=True) if soup.find("h1") else "No title found"
paragraphs = soup.find_all("div", class_="group")  # CNBC-specific container
text_blocks = []

for div in paragraphs:
    for p in div.find_all("p"):
        text_blocks.append(p.get_text(strip=True))

# Combine the content
article_data = {
    "url": url,
    "title": title,
    "content": text_blocks
}

# Step 4: Save to JSON
with open("trump_article.json", "w", encoding="utf-8") as f:
    json.dump(article_data, f, indent=2, ensure_ascii=False)

print("Article saved to trump_article.json")