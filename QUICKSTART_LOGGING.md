# Quick Start: Question Logging from Dashboard

## What's New?

You can now log questions directly from the Dashboard! The AI assigns 2 questions daily, and you can click "Log" to record your results instantly.

---

## How to Use

### 1. Open Dashboard
- Navigate to `/` or click "Dashboard" in sidebar
- AI automatically generates today's questions (takes 2-5 seconds on first load)

### 2. View Today's Questions
- Look for the "Today's Questions" card
- Shows 2 AI-assigned questions with:
  - Question title (clickable LeetCode link)
  - Difficulty badge (Easy/Medium/Hard)
  - Topic tag
  - "Log" button

### 3. Log a Question
- Click the "Log" button on any question
- Modal opens with **pre-filled data**:
  - ✅ Title (auto-filled)
  - ✅ Slug (auto-filled)
  - ✅ Topic (auto-filled)
  - ✅ Difficulty (auto-filled)
  - ✅ Date (today's date)
  - ✅ Result (defaults to "Solved")
- You only need to:
  - Adjust result if needed (Solved/Hint/Stuck)
  - Add optional notes

### 4. Save
- Click "Log Question"
- Question saved to database
- XP awarded automatically
- Toast notification appears
- TodayQuestions card updates to show completion

---

## Features

### Pre-filled Modal
- No typing question names
- No selecting topics/difficulty
- Just pick result and add notes
- Saves time and reduces errors

### Smart XP Calculation
- **Solved**: Easy=10, Medium=20, Hard=30
- **Hint**: Easy=5, Medium=10, Hard=15
- **Stuck**: 0 XP

### Auto-Flashcard Creation
- Add notes → Flashcard created automatically
- Touch 1, review in 3 days
- Appears in /flashcards page

### Real-time Updates
- TodayQuestions shows completion status
- Progress percentage updates
- Badge shows result (Solved/Hint/Stuck)

---

## Example Flow

```
1. Open Dashboard
   ↓
2. AI shows: "Two Sum" and "Valid Anagram"
   ↓
3. Click "Log" on "Two Sum"
   ↓
4. Modal opens with all fields pre-filled
   ↓
5. Select "Solved" and add notes: "Used hash map approach"
   ↓
6. Click "Log Question"
   ↓
7. ✅ Saved! +10 XP awarded
   ↓
8. TodayQuestions shows "Solved" badge
   ↓
9. Flashcard created (review in 3 days)
```

---

## Tips

- **Quick Logging**: If you solved it, just click "Log Question" (defaults to Solved)
- **Add Notes**: Notes create flashcards automatically for spaced repetition
- **Check Progress**: Progress bar shows X of 2 completed
- **LeetCode Link**: Click question title to open on LeetCode

---

## Troubleshooting

**Modal doesn't open?**
- Check console for errors
- Verify question exists in master pool

**Question not saving?**
- Check Supabase connection
- Verify database schema is up to date

**AI not generating questions?**
- Check Gemini API key in Settings
- Fallback system will assign questions if AI fails

---

## What's Next?

After logging questions:
- Check /log page to see all logged questions
- Visit /flashcards to review questions with notes
- Check RevisionPanel for spaced repetition reminders

---

**Status**: ✅ Ready to Use
**Last Updated**: Phase 9 Implementation
