import os
import re
import sys
import json
import time
import requests
from datetime import datetime

# Configuration
ONESIGNAL_APP_ID = os.environ.get('ONESIGNAL_APP_ID')
ONESIGNAL_API_KEY = os.environ.get('ONESIGNAL_API_KEY')
SITE_URL = "https://tharunaditya.github.io"

def check_url_availability(url, timeout=300):
    """Polls the URL until it returns 200 OK or timeout expires"""
    print(f"Waiting for deployment to propagate... (Target: {url})")
    start_time = time.time()
    
    while time.time() - start_time < timeout:
        try:
            r = requests.head(url)
            if r.status_code == 200:
                print("✅ Content is Live! Proceeding to notify.")
                return True
            else:
                print(f"⏳ Still 404/Pending... (Status: {r.status_code})")
        except Exception as e:
            print(f"⚠️ Connection error: {e}")
        
        time.sleep(15) # Check every 15 seconds
        
    print("❌ Timeout reached. The page did not go live within 5 minutes.")
    return False

def parse_frontmatter(file_path):
    """Simple regex parser for Jekyll frontmatter"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract title
    title_match = re.search(r'^title:\s*(?:["\'])(.*?)(?:["\'])', content, re.MULTILINE)
    if not title_match:
        title_match = re.search(r'^title:\s*(.*)', content, re.MULTILINE)
    
    # Extract excerpt/description
    desc_match = re.search(r'^excerpt:\s*(?:["\'])(.*?)(?:["\'])', content, re.MULTILINE)
    if not desc_match:
        desc_match = re.search(r'^description:\s*(?:["\'])(.*?)(?:["\'])', content, re.MULTILINE)

    title = title_match.group(1) if title_match else "New Security Insight"
    description = desc_match.group(1) if desc_match else "Check out the latest post on Tharunaditya Security."
    
    return title, description

def get_post_url(file_path):
    """Convert filename (2026-01-27-my-post.md) to URL (/2026/01/27/my-post.html)"""
    filename = os.path.basename(file_path)
    # Regex to capture YYYY-MM-DD-title.md
    match = re.match(r'(\d{4})-(\d{2})-(\d{2})-(.*)\.(md|markdown)', filename)
    
    if match:
        year, month, day, slug, ext = match.groups()
        # Adjusted to match _config.yml permalink: /blog/:year/:month/:day/:slug/
        return f"{SITE_URL}/blog/{year}/{month}/{day}/{slug}/"
    
    return SITE_URL

def send_notification(title, description, url):
    # Verify site is live before sending (Prevent 404s)
    if not check_url_availability(url):
        print("Skipping notification to avoid dead link.")
        return

    if not ONESIGNAL_APP_ID or not ONESIGNAL_API_KEY:
        print("Error: Missing OneSignal Credentials")
        sys.exit(1)

    header = {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": f"Basic {ONESIGNAL_API_KEY}"
    }

    payload = {
        "app_id": ONESIGNAL_APP_ID,
        "headings": {"en": title},
        "contents": {"en": description},
        "url": url,
        "included_segments": ["Total Subscriptions"] # Sends to everyone
    }

    print(f"Sending Notification for: {title}")
    print(f"URL: {url}")

    req = requests.post(
        "https://onesignal.com/api/v1/notifications",
        headers=header,
        data=json.dumps(payload)
    )

    print(f"Response Status: {req.status_code}")
    print(f"Response Body: {req.text}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python notify.py <path_to_new_post>")
        sys.exit(1)
        
    post_path = sys.argv[1]
    
    if not os.path.exists(post_path):
        print(f"File not found: {post_path}")
        sys.exit(1)

    print(f"Processing file: {post_path}")
    tit, desc = parse_frontmatter(post_path)
    link = get_post_url(post_path)
    
    send_notification(tit, desc, link)
