from newsapi import NewsApiClient
import requests
from bs4 import BeautifulSoup
import json
import time

NEWSAPI_KEY = "d7d7a5596a1d4145b9380d83f885b2e5"  #NewsAPI key
NUM_ARTICLES = 5  # Adjust as needed

newsapi = NewsApiClient(api_key=NEWSAPI_KEY)


def get_news_urls(ticker):
    print(f"Fetching recent news for: {ticker}")
    all_articles = newsapi.get_everything(
        q=ticker,
        language='en',
        sort_by='publishedAt',
        page_size=NUM_ARTICLES
    )
    return [article['url'] for article in all_articles['articles']]


def extract_article(url):
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        res = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(res.text, "html.parser")

        title = soup.find("h1")
        title = title.get_text(strip=True) if title else "No title"

        # Extract paragraphs from main content
        text_blocks = []
        for container in soup.find_all(["article", "div"], class_=lambda x: x and "content" in x):
            for p in container.find_all("p"):
                text = p.get_text(strip=True)
                if text:
                    text_blocks.append(text)

        if not text_blocks:
            text_blocks = [p.get_text(strip=True) for p in soup.find_all("p")]

        return {"url": url, "title": title, "content": text_blocks}
    except Exception as e:
        print(f"Failed to extract {url}: {e}")
        return None


def save_articles_json(ticker, articles):
    filename = f"{ticker}_news.json"
    with open(filename, "w", encoding="utf-8") as f:
        json.dump({"ticker": ticker, "articles": articles}, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(articles)} articles to {filename}")


def main(ticker):
    urls = get_news_urls(ticker)
    articles = []

    for url in urls:
        print(f"Scraping: {url}")
        article = extract_article(url)
        if article:
            articles.append(article)
        time.sleep(1)

    save_articles_json(ticker, articles)


if __name__ == "__main__":
    ticker_input = input("Enter stock ticker (e.g., AAPL, TSLA): ").strip().upper()
    main(ticker_input)
