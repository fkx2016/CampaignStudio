-- Add Tech Platforms with Icons
-- Fixed version with icon field

INSERT INTO platform (name, slug, base_url, icon, char_limit, is_active, default_hashtags, post_suffix, description, content_recommendations)
VALUES 
('Hacker News', 'hackernews', 'https://news.ycombinator.com/', '📰', 80, true, '', '', 
 'Tech news aggregator favored by developers, founders, and tech enthusiasts for thoughtful discussion.',
 'Technical deep-dives, startup stories, open-source projects, and security vulnerabilities work best; avoid marketing fluff.'),

('Hashnode', 'hashnode', 'https://hashnode.com/', '✍️', 5000, true, '#webdev #programming', '', 
 'Developer blogging platform with built-in community and SEO optimization for technical content.',
 'In-depth tutorials, project walkthroughs, and technical explainers; focus on teaching and sharing knowledge.'),

('Dev.to', 'devto', 'https://dev.to/', '👩‍💻', 5000, true, '#webdev #programming #opensource', '', 
 'Friendly developer community platform for sharing code, tutorials, and career advice.',
 'Beginner-friendly tutorials, career tips, project showcases, and "Today I Learned" posts resonate well.'),

('Reddit Tech', 'reddit_tech', 'https://reddit.com/r/programming', '🤖', 40000, true, '', '', 
 'Subreddit-based platform with tech communities like r/programming, r/webdev, r/javascript for niche discussions.',
 'Ask questions, share projects, discuss best practices; be authentic and contribute to discussions, not just self-promote.'),

('Stack Overflow', 'stackoverflow', 'https://stackoverflow.com/', '❓', 30000, true, '', '', 
 'Q&A platform for developers to ask and answer programming questions with reputation-based system.',
 'Specific technical questions with code examples; provide detailed answers with explanations and working code.'),

('GitHub', 'github', 'https://github.com/', '🐙', 65536, true, '', '', 
 'Code hosting platform with discussions, issues, and project showcases for open-source collaboration.',
 'Open-source project announcements, feature discussions, and bug reports; technical and collaborative tone.'),

('Snyk Blog', 'snyk', 'https://snyk.io/blog/', '🔒', 3000, false, '#security #devsecops', '', 
 'Developer security platform and blog focused on vulnerability management and secure coding practices.',
 'Security vulnerabilities, dependency updates, and DevSecOps best practices; technical and security-focused content.'),

('Wiz Blog', 'wiz', 'https://www.wiz.io/blog', '☁️', 3000, false, '#cloudsecurity #kubernetes', '', 
 'Cloud security platform blog covering AWS, Azure, GCP, and Kubernetes security topics.',
 'Cloud security incidents, infrastructure vulnerabilities, and compliance topics; highly technical cloud-focused content.')

ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  base_url = EXCLUDED.base_url,
  icon = EXCLUDED.icon,
  char_limit = EXCLUDED.char_limit,
  is_active = EXCLUDED.is_active,
  default_hashtags = EXCLUDED.default_hashtags,
  post_suffix = EXCLUDED.post_suffix,
  description = EXCLUDED.description,
  content_recommendations = EXCLUDED.content_recommendations;
