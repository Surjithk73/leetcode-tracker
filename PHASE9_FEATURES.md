# Phase 9: Pre-Assigned Questions, Data Explorer, Snippets & Flashcards

## Overview

Phase 9 introduces a major enhancement to the LeetCode Prep Tracker with four interconnected features:

1. **Master Question Pool** - Static JSON files with NeetCode 150 and Striver's SDE Sheet
2. **Data Explorer** - Browse and track progress across all questions
3. **Code Snippets Library** - Personal collection of reusable Python patterns
4. **Unified Flashcard System** - Spaced repetition for question notes and snippets

## Database Migration

**IMPORTANT:** Before using these features, run the migration:

1. Go to your Supabase project → SQL Editor
2. Open `supabase/migration_phase9.sql`
3. Copy and paste the entire contents
4. Click **Run**

This adds:
- `slug`, `flashcard_touch`, `flashcard_next_review` columns to `questions` table
- New `snippets` table with RLS policies

## Feature 1: Master Question Pool

### What's New

Two static JSON files embedded in the codebase:
- `/src/data/neetcode150.json` - Full NeetCode 150 list
- `/src/data/striver_sde.json` - Striver's SDE Sheet

Each question has:
```json
{
  "id": "nc_001",
  "title": "Two Sum",
  "slug": "two-sum",
  "topic": "Arrays",
  "difficulty": "Easy",
  "source": "neetcode",
  "order": 1
}
```

### Deduplication Logic

Questions with matching `slug` values are automatically merged:
- Combined sources: `["neetcode", "striver"]`
- Lower `order` number is used for sequencing
- Single master pool used for all planning

### Usage

```typescript
import { getMasterQuestionPool, getQuestionBySlug } from '@/lib/questionPool'

const allQuestions = getMasterQuestionPool() // Deduplicated merged pool
const question = getQuestionBySlug('two-sum')
```

## Feature 2: Data Explorer (`/data`)

### Three Tabs

1. **All Questions** - Deduplicated merged pool
2. **NeetCode 150** - Only NeetCode questions
3. **Striver's SDE Sheet** - Only Striver questions

### Features

- **Filters**: Topic, Difficulty, Source (Both/NeetCode/Striver), Status (Completed/Pending)
- **Progress Tracking**: Shows completion percentage
- **Status Indicators**: Green (Completed) / Grey (Pending)
- **Clickable Links**: All question titles link to LeetCode
- **Mobile Responsive**: Table collapses to cards on mobile

### Status Logic

A question is marked "Completed" if it exists in the `questions` table with a matching `slug` (at least Touch 1 completed).

## Feature 3: Code Snippets (`/snippets`)

### Purpose

Personal library of reusable Python code patterns and utilities. Each snippet is also a flashcard.

### Creating Snippets

1. Click **New Snippet**
2. Enter a title
3. Write markdown content (supports Python code blocks)
4. Toggle **Preview** to see rendered output
5. Click **Save**

### Markdown Support

```markdown
# Binary Search Template

```python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
\```

**Time Complexity:** O(log n)
**Space Complexity:** O(1)
```

### Automatic Flashcard Entry

On save:
- `touch_number` = 1
- `next_review_date` = today + 3 days
- Enters the unified flashcard queue

### Editing & Deleting

- Click the **Edit** icon to modify
- Click the **Delete** icon (with confirmation)
- Editing does NOT reset the revision schedule

## Feature 4: Unified Flashcard System (`/flashcards`)

### Two Flashcard Types

#### 1. Question Notes
- **Source**: `questions` table where `notes` is non-empty
- **Front**: Question title + LeetCode link button
- **Back**: User's notes (markdown rendered)
- **Separate Track**: Uses `flashcard_touch` and `flashcard_next_review` fields

#### 2. Code Snippets
- **Source**: `snippets` table
- **Front**: Snippet title
- **Back**: Full markdown content with syntax-highlighted code

### Review Flow

1. Click **Start Review** on `/flashcards`
2. See the front of the card
3. Click **Show Answer** to reveal the back
4. Choose response:
   - **Got It** → Advance touch (+5 XP)
   - **Shaky** → Reschedule for tomorrow
   - **Missed** → Reset to Touch 1

### Touch Advancement

- **Touch 1 → Touch 2**: +7 days
- **Touch 2 → Touch 3**: Marked as mastered (no further reviews)
- **Shaky**: Same touch, next_review = tomorrow
- **Missed**: Reset to Touch 1, next_review = today + 3

### Session Summary

After completing all cards:
- Total cards reviewed
- Breakdown: Got It / Shaky / Missed
- XP earned (5 XP per "Got It")

### Dashboard Integration

The "Revisions Due Today" section on the Dashboard shows:
- Count of all due flashcards (questions + snippets)
- **Start Review** button launches the flashcard UI

## Question Logging with Notes

### Enhanced Flow

When logging a question (from assigned list or unplanned):

1. Select result (Solved/Hint/Stuck)
2. **Notes textarea appears** below result selector
3. If notes are entered:
   - Stored in `questions.notes`
   - Enters flashcard queue with `flashcard_touch: 1`
   - `flashcard_next_review: today + 3`
4. If no notes:
   - Question still enters 3-touch re-solve pipeline
   - No flashcard entry

### Dual Revision Tracks

A question can have TWO parallel revision schedules:

1. **Re-solve Track**: `touch_number` / `next_review_date` (always active)
2. **Flashcard Track**: `flashcard_touch` / `flashcard_next_review` (only if notes exist)

These advance independently.

## Navigation Updates

### Desktop Sidebar

New items added:
- **Data** (Database icon)
- **Snippets** (Code icon)
- **Flashcards** (Layers icon)

### Mobile Hamburger Menu

Same items added to the dropdown menu.

## Pre-Assigned Daily Questions (Coming Soon)

### Concept

Instead of generic "log 2 questions today", the planner will assign **specific named questions** to each date.

### Dashboard Changes

**"Today's Questions" card** will show:
- List of assigned questions for today
- Each with: Title (LeetCode link), Difficulty, Topic
- Status: Pending / Solved / Hint / Stuck
- **Log** button opens pre-filled modal

### AI Plan Generation

On first setup or manual trigger:
- AI receives full deduplicated question pool
- Assigns specific questions to dates
- Respects topic order (all Arrays before Strings, etc.)
- Writes `assigned_questions` (array of slugs) to `plan` table

### AI Replanning

When triggered:
- AI receives current plan + completion status
- Redistributes missed questions to future days
- Maintains topic order
- Factors in revision load per day

## Out of Scope

- Multi-language snippet support (Python only)
- AI-generated snippets
- Automatic note generation
- Sharing snippets externally
- Advanced spaced repetition algorithms (SM-2, Anki)

## Tips

1. **Add notes to important questions** - They become flashcards automatically
2. **Create snippets for patterns** - Not just code, but explanations too
3. **Review daily** - The flashcard queue is designed for daily practice
4. **Use markdown formatting** - Makes snippets more readable
5. **Track progress in Data page** - See which topics need more work

## Troubleshooting

### "No questions match the current filters"
- Reset filters to "All"
- Check if you've logged any questions yet

### Flashcard not appearing in queue
- Check `next_review_date` in database
- Ensure `touch_number` < 3
- For question notes, ensure `notes` field is non-empty

### Snippet preview not rendering
- Check markdown syntax
- Ensure code blocks use triple backticks with `python` language tag

### Migration errors
- Ensure you're running the migration on the correct Supabase project
- Check that tables exist before adding columns
- If columns already exist, the migration will skip them (IF NOT EXISTS)

## Next Steps

1. Run the database migration
2. Explore the Data page to see the master question pool
3. Create your first code snippet
4. Add notes to a logged question
5. Review flashcards daily

Happy coding! 🚀
