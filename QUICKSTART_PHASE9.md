# Quick Start Guide - Phase 9 Features

## Prerequisites

1. Existing LeetCode Tracker installation
2. Supabase project set up
3. Database with original schema

## Step 1: Database Migration

**CRITICAL:** Run this first before starting the app.

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New query**
4. Open `leetcode-tracker/supabase/migration_phase9.sql`
5. Copy the entire contents
6. Paste into the SQL Editor
7. Click **Run**
8. You should see: "Success. No rows returned."

This adds:
- `slug` column to `questions` table
- `flashcard_touch` and `flashcard_next_review` columns to `questions` table
- New `snippets` table
- RLS policies for `snippets`

## Step 2: Start the Development Server

```bash
cd leetcode-tracker
npm run dev
```

App runs at `http://localhost:5173`

## Step 3: Explore the Data Page

1. Click **Data** in the sidebar (or hamburger menu on mobile)
2. You'll see three tabs:
   - **All Questions**: Merged pool (10 sample questions)
   - **NeetCode 150**: NeetCode questions only
   - **Striver's SDE Sheet**: Striver questions only
3. Try the filters:
   - Topic: Select "Arrays"
   - Difficulty: Select "Easy"
   - Status: Select "Pending" (all will be pending initially)
4. Click any question title to open it on LeetCode

## Step 4: Create Your First Snippet

1. Click **Snippets** in the sidebar
2. Click **New Snippet**
3. Enter a title: "Binary Search Template"
4. In the editor, paste:

```markdown
# Binary Search Template

Standard binary search implementation:

\```python
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

## Key Points
- Always check `left <= right`
- Update `left` or `right` based on comparison
- Return -1 if not found
```

5. Click **Preview** to see the rendered output
6. Click **Save**
7. The snippet is now in your library AND in the flashcard queue!

## Step 5: Log a Question with Notes

1. Go to **Dashboard**
2. Click **Log Question**
3. Enter:
   - Question: "Two Sum"
   - Difficulty: Easy
   - Topic: Arrays
   - Result: Solved
   - Notes: "Use hashmap to store complements. O(n) time, O(n) space."
4. Click **Log Question**
5. This question is now in BOTH:
   - Re-solve revision queue (Touch 1)
   - Flashcard queue (for the notes)

## Step 6: Review Flashcards

1. Click **Flashcards** in the sidebar
2. You should see "2 flashcards due today":
   - 1 Question Note (Two Sum)
   - 1 Code Snippet (Binary Search Template)
3. Click **Start Review**
4. For each card:
   - Read the front
   - Click **Show Answer**
   - Choose your response:
     - **Got It**: You remember it well (+5 XP, advances to Touch 2)
     - **Shaky**: You're unsure (reschedules for tomorrow)
     - **Missed**: You forgot (resets to Touch 1)
5. After reviewing both cards, see your session summary

## Step 7: Check Progress in Data Page

1. Go back to **Data**
2. The "Two Sum" question should now show **Completed** status
3. Progress bar should show "1 of 10 (10%)"

## Testing the Full Flow

### Create Multiple Snippets

Create 3-4 more snippets with different patterns:
- Two Pointers
- Sliding Window
- DFS Template
- DP Memoization

### Log Multiple Questions

Log 5-6 questions from the Data page:
1. Open Data page
2. Click a question title to open LeetCode
3. "Solve" it (or pretend to)
4. Go to Dashboard → Log Question
5. Enter the question name and add notes
6. Repeat

### Review Over Multiple Days

The flashcard system uses spaced repetition:
- **Day 1**: Create snippets and log questions with notes
- **Day 4**: Review Touch 1 cards (they're due after 3 days)
- **Day 11**: Review Touch 2 cards (they're due after 7 more days)
- **Day 11+**: Touch 3 cards are mastered (no more reviews)

To test this quickly, you can manually update `next_review_date` in Supabase:

1. Go to Supabase → Table Editor → `snippets`
2. Find your snippet
3. Change `next_review_date` to today's date
4. Refresh the Flashcards page
5. The snippet should appear in the queue

## Mobile Testing

1. Resize your browser to mobile width (< 768px)
2. Check that:
   - Hamburger menu appears (top-right)
   - All pages are accessible
   - Data page shows cards instead of table
   - Snippets grid adapts
   - Flashcards are full-screen

## Troubleshooting

### "No flashcards due today"
- Check that you created snippets or logged questions with notes
- Verify `next_review_date` is today or earlier in the database

### "No questions match the current filters"
- Reset all filters to "All"
- Check that the JSON files loaded correctly

### Snippet preview not rendering
- Ensure code blocks use triple backticks: \```python
- Check for markdown syntax errors

### Database errors
- Verify you ran the migration SQL
- Check Supabase logs for errors
- Ensure RLS policies are enabled

## Next Steps

1. **Expand JSON files**: Add the full 150 NeetCode questions and Striver SDE sheet
2. **Integrate with Dashboard**: Show today's assigned questions
3. **AI Plan Generation**: Generate initial question assignments
4. **AI Replanning**: Redistribute missed questions

## Sample Data

If you want to quickly populate the database with test data:

```sql
-- Run in Supabase SQL Editor

-- Insert a few test questions
INSERT INTO questions (name, slug, difficulty, topic, result, date_logged, notes)
VALUES 
  ('Two Sum', 'two-sum', 'Easy', 'Arrays', 'Solved', CURRENT_DATE, 'Use hashmap for O(n) solution'),
  ('Best Time to Buy and Sell Stock', 'best-time-to-buy-and-sell-stock', 'Easy', 'Arrays', 'Solved', CURRENT_DATE, 'Track min price and max profit'),
  ('Contains Duplicate', 'contains-duplicate', 'Easy', 'Arrays', 'Hint', CURRENT_DATE - 1, 'Can use set for O(n) time');

-- Set flashcard review dates to today
UPDATE questions 
SET flashcard_next_review = CURRENT_DATE, flashcard_touch = 1
WHERE notes IS NOT NULL;

-- Insert a test snippet
INSERT INTO snippets (title, content_markdown, next_review_date, touch_number)
VALUES (
  'DFS Template',
  E'# DFS Template\n\n```python\ndef dfs(node, visited):\n    if node in visited:\n        return\n    \n    visited.add(node)\n    \n    for neighbor in node.neighbors:\n        dfs(neighbor, visited)\n```\n\n**Time:** O(V + E)\n**Space:** O(V)',
  CURRENT_DATE,
  1
);
```

## Feedback & Issues

If you encounter any issues:
1. Check the browser console for errors
2. Check Supabase logs
3. Verify the migration ran successfully
4. Review `PHASE9_FEATURES.md` for detailed documentation

Happy coding! 🚀
