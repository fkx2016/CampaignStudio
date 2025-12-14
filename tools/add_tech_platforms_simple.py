"""
Quick script to add tech platforms
Run with: python add_tech_platforms_simple.py
"""
import requests

# Backend API endpoint
API_URL = "http://localhost:8001/api"

tech_platforms = [
    {
        "name": "Hacker News",
        "slug": "hackernews",
        "base_url": "https://news.ycombinator.com/",
        "icon": "📰",
        "char_limit": 80,
        "is_active": True,
        "default_hashtags": "",
        "post_suffix": "",
        "description": "Tech news aggregator favored by developers, founders, and tech enthusiasts for thoughtful discussion.",
        "content_recommendations": "Technical deep-dives, startup stories, open-source projects, and security vulnerabilities work best; avoid marketing fluff."
    },
    {
        "name": "Hashnode",
        "slug": "hashnode",
        "base_url": "https://hashnode.com/",
        "icon": "✍️",
        "char_limit": 5000,
        "is_active": True,
        "default_hashtags": "#webdev #programming",
        "post_suffix": "",
        "description": "Developer blogging platform with built-in community and SEO optimization for technical content.",
        "content_recommendations": "In-depth tutorials, project walkthroughs, and technical explainers; focus on teaching and sharing knowledge."
    },
    {
        "name": "Dev.to",
        "slug": "devto",
        "base_url": "https://dev.to/",
        "icon": "👩‍💻",
        "char_limit": 5000,
        "is_active": True,
        "default_hashtags": "#webdev #programming #opensource",
        "post_suffix": "",
        "description": "Friendly developer community platform for sharing code, tutorials, and career advice.",
        "content_recommendations": "Beginner-friendly tutorials, career tips, project showcases, and 'Today I Learned' posts resonate well."
    },
    {
        "name": "Reddit Tech",
        "slug": "reddit_tech",
        "base_url": "https://reddit.com/r/programming",
        "icon": "🤖",
        "char_limit": 40000,
        "is_active": True,
        "default_hashtags": "",
        "post_suffix": "",
        "description": "Subreddit-based platform with tech communities like r/programming, r/webdev, r/javascript for niche discussions.",
        "content_recommendations": "Ask questions, share projects, discuss best practices; be authentic and contribute to discussions, not just self-promote."
    },
    {
        "name": "Stack Overflow",
        "slug": "stackoverflow",
        "base_url": "https://stackoverflow.com/",
        "icon": "❓",
        "char_limit": 30000,
        "is_active": True,
        "default_hashtags": "",
        "post_suffix": "",
        "description": "Q&A platform for developers to ask and answer programming questions with reputation-based system.",
        "content_recommendations": "Specific technical questions with code examples; provide detailed answers with explanations and working code."
    },
    {
        "name": "GitHub",
        "slug": "github",
        "base_url": "https://github.com/",
        "icon": "🐙",
        "char_limit": 65536,
        "is_active": True,
        "default_hashtags": "",
        "post_suffix": "",
        "description": "Code hosting platform with discussions, issues, and project showcases for open-source collaboration.",
        "content_recommendations": "Open-source project announcements, feature discussions, and bug reports; technical and collaborative tone."
    },
    {
        "name": "Snyk Blog",
        "slug": "snyk",
        "base_url": "https://snyk.io/blog/",
        "icon": "🔒",
        "char_limit": 3000,
        "is_active": False,
        "default_hashtags": "#security #devsecops",
        "post_suffix": "",
        "description": "Developer security platform and blog focused on vulnerability management and secure coding practices.",
        "content_recommendations": "Security vulnerabilities, dependency updates, and DevSecOps best practices; technical and security-focused content."
    },
    {
        "name": "Wiz Blog",
        "slug": "wiz",
        "base_url": "https://www.wiz.io/blog",
        "icon": "☁️",
        "char_limit": 3000,
        "is_active": False,
        "default_hashtags": "#cloudsecurity #kubernetes",
        "post_suffix": "",
        "description": "Cloud security platform blog covering AWS, Azure, GCP, and Kubernetes security topics.",
        "content_recommendations": "Cloud security incidents, infrastructure vulnerabilities, and compliance topics; highly technical cloud-focused content."
    }
]

def add_platforms():
    for platform in tech_platforms:
        try:
            response = requests.post(f"{API_URL}/platforms", json=platform)
            if response.status_code == 200:
                print(f"✅ Added: {platform['name']}")
            else:
                print(f"⚠️  {platform['name']}: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"❌ Error adding {platform['name']}: {e}")

if __name__ == "__main__":
    print("Adding tech platforms to Campaign Studio...\n")
    add_platforms()
    print("\n✅ Done!")
