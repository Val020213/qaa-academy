// Draws the Markdown of a lesson.
//
// This is the ONLY place in the app that uses dangerouslySetInnerHTML. It is
// safe here because the HTML comes from our own Markdown files in content/,
// written by the course authors. Never do this with text typed by a user.

import { renderMarkdown } from "@/lib/content"

export function LessonBody({ markdown }: { markdown: string }) {
  return (
    <div
      className="typeset typeset-docs lesson-prose"
      data-testid="lesson-content"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
    />
  )
}
