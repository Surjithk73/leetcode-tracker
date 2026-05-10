# Quick Start: AI Daily Planner

## 🚀 Get Started in 3 Steps

### Step 1: Ensure Gemini API Key is Set

```bash
# Open the app
npm run dev
```

Visit `http://localhost:5173/settings`

- Scroll to "Gemini API Key"
- Paste your API key (or it should already be there from `.env`)
- Click Save

### Step 2: Open Dashboard

Visit `http://localhost:5173`

You should see:
1. **Loading state**: "AI is planning your questions for today..." (2-5 seconds)
2. **Questions appear**: 2 questions with titles, difficulty, topics
3. **AI reasoning**: Brief explanation below the title
4. **Progress**: "0 of 2 completed"

### Step 3: Test the Flow

**Scenario 1: First Time (No Questions Solved)**

Expected behavior:
- AI assigns first 2 questions from Arrays topic
- Reasoning: "Starting your prep journey with foundational Array problems."
- Questions: "Two Sum" and "Best Time to Buy and Sell Stock" (or similar)

**Scenario 2: Log a Question**

1. Click a question title → Opens LeetCode
2. "Solve" the question (or pretend to)
3. Click "Log" button
4. Select result: Solved / Hint / Stuck
5. Add notes (optional)
6. Click "Log Question"
7. Status updates to "Solved" (green checkmark)
8. Progress updates to "1 of 2 completed (50%)"

**Scenario 3: Next Day**

1. Refresh the page (simulates next day)
2. AI checks: 1 question completed yesterday, 1 postponed
3. AI assigns: 1 postponed + 1 new
4. Reasoning: "Catching up on 1 postponed question, plus continuing Arrays."

## 🧪 Testing Checklist

- [ ] Dashboard loads without errors
- [ ] "AI is planning..." appears briefly
- [ ] 2 questions display after 2-5 seconds
- [ ] Reasoning text is visible and makes sense
- [ ] Question titles are clickable (open LeetCode in new tab)
- [ ] Difficulty badges are color-coded (Easy=green, Medium=yellow, Hard=red)
- [ ] Topic tags are visible
- [ ] "Log" buttons are present
- [ ] Progress shows "0 of 2 completed (0%)"

## 🔧 Troubleshooting

### Problem: "AI is planning..." never finishes

**Cause**: Gemini API key missing or invalid

**Fix**:
1. Check browser console for errors
2. Go to Settings → Gemini API Key
3. Verify key is correct
4. Try regenerating key at https://aistudio.google.com/app/apikey

### Problem: No questions appear

**Cause**: Database empty or questions not loaded

**Fix**:
1. Visit `/data` page
2. Check if 341 questions are loaded
3. If not, run conversion script:
   ```bash
   node scripts/convertData.js
   ```
4. Refresh Dashboard

### Problem: Same questions every day

**Cause**: Questions not being marked as solved in database

**Fix**:
1. Check Supabase → `questions` table
2. Verify `slug` field is populated
3. Verify `date_logged` is today's date
4. Check `plan` table → `assigned_questions` array

### Problem: AI reasoning doesn't make sense

**Cause**: AI hallucinating or prompt needs adjustment

**Fix**:
1. Check `src/lib/aiPlanner.ts`
2. Review prompt structure
3. Adjust context or rules
4. Test with different scenarios

## 📊 Expected AI Behavior

### New User (0 questions)
```
Assigned: ["two-sum", "best-time-to-buy-and-sell-stock"]
Reasoning: "Starting your prep journey with foundational Array problems."
```

### User with Progress (50 questions)
```
Assigned: ["reverse-linked-list", "merge-two-sorted-lists"]
Reasoning: "Continuing with Linked Lists topic. You've completed 3/11 questions."
```

### User with Postponed (3 missed)
```
Assigned: ["contains-duplicate", "valid-anagram"]
Reasoning: "Catching up on postponed questions from previous days."
```

### User Struggling (4 Stuck in last 5)
```
Assigned: ["two-sum", "contains-duplicate"]
Reasoning: "Recent struggles detected. Assigned easier questions to build confidence."
```

## 🎯 Success Criteria

✅ AI generates plan in <6 seconds
✅ Questions are valid (exist in master pool)
✅ Reasoning is clear and helpful
✅ No duplicate questions
✅ Topic order is maintained
✅ Postponed questions are prioritized
✅ Difficulty adjusts based on performance
✅ Fallback works if AI fails

## 📝 Manual Test Script

```bash
# 1. Fresh start
npm run dev

# 2. Open Dashboard
# Expected: Loading → 2 questions appear

# 3. Check console
# Should see: "AI planning..." logs

# 4. Click question title
# Expected: LeetCode opens in new tab

# 5. Click "Log" button
# Expected: Modal opens (or console log for now)

# 6. Refresh page
# Expected: Same questions (plan cached for today)

# 7. Check Supabase
# Table: plan
# Should have 1 row with today's date
# assigned_questions: ["slug1", "slug2"]

# 8. Manually change date in database to yesterday
# Refresh Dashboard
# Expected: New questions generated for today
```

## 🚨 Common Issues

### Issue: TypeScript errors

**Fix**: Run diagnostics
```bash
npm run build
```

All Phase 9 files should compile without errors.

### Issue: Slow AI response (>10 seconds)

**Cause**: Gemini API slow or rate limited

**Fix**:
- Wait and retry
- Check API quota at https://aistudio.google.com
- Fallback will activate after timeout

### Issue: Questions not updating after logging

**Cause**: Database not updating or cache issue

**Fix**:
1. Check browser console for errors
2. Verify Supabase connection
3. Check `questions` table for new row
4. Hard refresh (Ctrl+Shift+R)

## 🎉 You're Ready!

If all tests pass, you have a fully functional AI-powered daily planner!

**Next Steps:**
1. Use it daily for a week
2. Observe AI reasoning patterns
3. Provide feedback on question selection
4. Iterate on prompt if needed

**Enjoy your AI-powered LeetCode prep! 🚀**
