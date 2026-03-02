/**
 * Prompts for extracting style guide (and optional product info) from landing page data.
 */

import type { LandingPageData } from "../lib/landingPageExtractor.js";

export function getLandingPageExtractionPrompt(
  includeProductInfo: boolean = false
): string {
  return `You are an expert at analyzing landing pages and extracting brand style guides and ${
    includeProductInfo ? "product information" : "visual styling"
  }.

Your task is to analyze the provided landing page data (meta tags, content, colors, fonts, images) and extract a comprehensive style guide that can be used to generate consistent video content.

## Output Format

Return a JSON object with the following structure:

\`\`\`json
{
  "styleGuide": {
    "tone": "descriptive tone (e.g., 'professional and trustworthy', 'energetic and youthful')",
    "color_palette": ["#hex1", "#hex2", "#hex3"],
    "tempo": "fast" | "medium" | "slow",
    "camera_style": "descriptive camera style (e.g., 'smooth tracking shots', 'dynamic handheld')",
    "brand_voice": "brand voice description (e.g., 'friendly and approachable', 'bold and confident')",
    "must_include": ["element1", "element2"],
    "must_avoid": ["element1", "element2"]
  }${
    includeProductInfo
      ? `,
  "productInfo": {
    "name": "product or brand name",
    "description": "product description (2-3 sentences)",
    "targetAudience": "target audience description"
  }`
      : ""
  }
}
\`\`\`

## Analysis Guidelines

1. **Tone**: Infer the emotional tone from:
   - Heading language (formal vs casual, exciting vs calm)
   - Content style (storytelling, factual, persuasive)
   - Visual hierarchy (bold and dramatic vs minimal and refined)

2. **Color Palette**: 
   - Use the provided primary colors
   - Limit to 3-5 most representative colors
   - Order by importance/frequency

3. **Tempo**:
   - "fast": Energetic site with many elements, short copy, action-oriented
   - "medium": Balanced pacing, moderate content density
   - "slow": Calm, spacious, longer reading time, minimal

4. **Camera Style**:
   - Infer from visual style:
     - Spacious layouts → "smooth, slow pans"
     - Dynamic angles in images → "dynamic angles, quick cuts"
     - Product-focused → "close-up detail shots"
     - Lifestyle imagery → "wide establishing shots, natural movement"

5. **Brand Voice**:
   - Extract from headings, taglines, and key copy
   - Note: friendly, professional, playful, authoritative, etc.

6. **Must Include**:
   - Key brand elements mentioned frequently
   - Unique selling points
   - Signature visual elements (e.g., "product close-ups", "lifestyle scenes")

7. **Must Avoid**:
   - Infer from brand positioning what doesn't fit
   - Competing brand elements
   - Off-brand aesthetics

${
  includeProductInfo
    ? `
8. **Product Info** (if includeProductInfo is true):
   - Extract product/brand name from title and headings
   - Summarize product description from main copy
   - Infer target audience from tone and content
`
    : ""
}

## Important Notes

- Be specific and actionable in your descriptions
- Base all conclusions on the provided data
- If certain information is not clear, make reasonable inferences
- Prioritize the most prominent and repeated elements
- Ensure color_palette contains valid hex codes

Return ONLY the JSON object, no additional text.`;
}

/**
 * Prompt for feature-only extraction: only product/feature info from the given content block.
 * No style guide; output is only productInfo.
 */
export function getFeatureExtractionPrompt(): string {
  return `You are an expert at extracting product and feature information from web page content.

The user has provided a **feature section** from a single URL (not the full page). Your task is to extract only product/feature information suitable for a video idea: product name, description, and target audience.

## Output Format

Return a JSON object with this structure only:

\`\`\`json
{
  "productInfo": {
    "name": "product or brand name",
    "description": "product description (2-3 sentences, suitable for video brief)",
    "targetAudience": "target audience description"
  }
}
\`\`\`

## Guidelines

- **name**: From title, main heading, or product name in the content.
- **description**: Summarize what the product/feature does and why it matters; keep it concise for a video script brief.
- **targetAudience**: Who is this for? Infer from tone, language, and content.
- Base everything only on the provided text. If something is missing, use reasonable short placeholders or omit.

Return ONLY the JSON object, no additional text.`;
}

export function buildFeaturePrompt(url: string, data: LandingPageData): string {
  return `Feature section from URL: ${url}

## Meta (page-level)
Title: ${data.title}
Description: ${data.description}

## Headings (from feature section)
H1: ${data.headings.h1.join(" | ") || "(none)"}
H2: ${data.headings.h2.slice(0, 5).join(" | ") || "(none)"}
H3: ${data.headings.h3.slice(0, 3).join(" | ") || "(none)"}

## Content
${data.paragraphs
  .slice(0, 8)
  .map(
    (p, i) =>
      `Paragraph ${i + 1}: ${p.slice(0, 300)}${p.length > 300 ? "..." : ""}`
  )
  .join("\n") || "(no paragraphs)"}

${data.htmlSnippet ? `## HTML excerpt\n${data.htmlSnippet}` : ""}

Extract product/feature info (name, description, targetAudience) from the above.`;
}

export function buildLandingPagePrompt(
  url: string,
  data: LandingPageData
): string {
  return `Landing Page URL: ${url}

## Meta Information
Title: ${data.title}
Description: ${data.description}
Keywords: ${data.keywords.join(", ")}

## Content Structure
Sections: ${data.sections}
Has Video: ${data.hasVideo ? "Yes" : "No"}
Has CTA: ${data.hasCTA ? "Yes" : "No"}
Image Count: ${data.imageCount}

## Headings
H1: ${data.headings.h1.join(" | ") || "(none)"}
H2: ${data.headings.h2.slice(0, 5).join(" | ") || "(none)"}

## Key Content
${data.paragraphs
  .slice(0, 5)
  .map(
    (p, i) =>
      `Paragraph ${i + 1}: ${p.slice(0, 200)}${p.length > 200 ? "..." : ""}`
  )
  .join("\n") || "(no paragraphs)"}

## Visual Style

### Colors
Primary Colors: ${data.colors.primary.join(", ") || "(none)"}
Background Colors: ${data.colors.background.join(", ") || "(none)"}
Text Colors: ${data.colors.text.join(", ") || "(none)"}

### Typography
Heading Fonts: ${data.fonts.headings.join(", ") || "(none)"}
Body Fonts: ${data.fonts.body.join(", ") || "(none)"}

${data.heroImage ? `## Hero Image\n${data.heroImage}` : ""}
${data.logoImage ? `## Logo\n${data.logoImage}` : ""}
${data.htmlSnippet ? `## HTML Structure (excerpt)\n${data.htmlSnippet}` : ""}

Analyze the above data and extract the style guide.`;
}
