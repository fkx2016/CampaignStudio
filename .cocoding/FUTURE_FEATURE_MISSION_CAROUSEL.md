# 💰 Mission Statement Carousel - Future Feature

## Concept
A rotating carousel of powerful, bold statements that reinforce our revenue-focused mission. Each visit shows a different commitment to help users monetize.

## Example Statements

### Power Reversal
- "The internet wants to make money off you. We help you make money off them instead."
- "They've been farming you. Time to farm them."
- "Stop being the product. Start being the profit."

### Shadow Acknowledgment
- "We see what you really want. And we're built to deliver it."
- "You came for engagement. We're giving you income."
- "Every campaign is a revenue opportunity. We'll show you how."

### Bold Commitments
- "We're going to make you money (even if you don't want us to)."
- "Built to monetize everything you do."
- "Turn every post into profit."
- "Your content should pay you, not just platforms."

### Jungian Depth
- "We honor your shadow. We monetize it."
- "The desire for money isn't shameful. It's human."
- "Impact without income isn't sustainable."

### Direct & Provocative
- "Great campaigns shouldn't cost you money. They should make you money."
- "Ready to stop leaving money on the table?"
- "Revenue isn't a side effect. It's the point."

## Implementation Ideas

### Location Options
1. **Hero Badge** - Replace "We're Going to Make You Money" with rotating text
2. **Above Footer** - Dedicated section with large, bold statement
3. **Between Sections** - Subtle carousel between features and CTA

### Technical Approach
```typescript
const missionStatements = [
  "The internet wants to make money off you. We help you make money off them instead.",
  "We're going to make you money (even if you don't want us to).",
  "Stop being the product. Start being the profit.",
  // ... more statements
];

// Rotate on page load or every X seconds
const [currentStatement, setCurrentStatement] = useState(
  missionStatements[Math.floor(Math.random() * missionStatements.length)]
);
```

### Animation
- Smooth fade in/out transitions
- Auto-rotate every 5-7 seconds
- Or random selection on each page load
- Optional: User can click to see next statement

### Design
- Large, bold typography
- Green accent color (money theme)
- Subtle animation (fade, slide, or pulse)
- Optional: Quote marks or decorative elements

## Why This Works

1. **Reinforces Mission** - Every visit reminds users of our bold promise
2. **Keeps Content Fresh** - Different message each time = more engaging
3. **Builds Brand** - Memorable, quotable statements
4. **Psychological Impact** - Repetition with variation = powerful messaging
5. **Shareability** - Users might screenshot and share favorite quotes

## Priority
- **Phase:** Post-MVP
- **Effort:** Low (simple component)
- **Impact:** Medium-High (brand building)
- **Dependencies:** None

## Notes
- Could also use these in email campaigns
- Social media quote graphics
- Loading screen messages
- 404 page humor
