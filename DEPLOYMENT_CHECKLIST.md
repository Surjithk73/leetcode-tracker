# Phase 9 Deployment Checklist

## Pre-Deployment

### 1. Database Migration
- [ ] Open Supabase project dashboard
- [ ] Navigate to SQL Editor
- [ ] Run `supabase/migration_phase9.sql`
- [ ] Verify success message
- [ ] Check that `snippets` table exists
- [ ] Check that `questions` table has new columns

### 2. Code Review
- [ ] All TypeScript files compile without errors
- [ ] No console errors in browser
- [ ] All imports resolve correctly
- [ ] JSON files are in correct location

### 3. Local Testing
- [ ] Run `npm run dev`
- [ ] Visit all new pages:
  - [ ] `/data` - All three tabs load
  - [ ] `/snippets` - Can create/edit/delete
  - [ ] `/flashcards` - Queue loads correctly
- [ ] Test navigation:
  - [ ] Desktop sidebar shows new items
  - [ ] Mobile hamburger shows new items
- [ ] Test mobile responsiveness:
  - [ ] Data page shows cards
  - [ ] Snippets grid adapts
  - [ ] Flashcards are full-screen

## Deployment Steps

### 1. Commit Changes
```bash
git add .
git commit -m "feat: Phase 9 - Data Explorer, Snippets, Flashcards"
git push origin main
```

### 2. Vercel/Netlify Deployment
- [ ] Push triggers automatic deployment
- [ ] Wait for build to complete
- [ ] Check build logs for errors

### 3. Production Database
- [ ] Run migration on production Supabase
- [ ] Verify tables created
- [ ] Test RLS policies

### 4. Production Testing
- [ ] Visit production URL
- [ ] Test all new pages
- [ ] Check mobile experience
- [ ] Verify LeetCode links work
- [ ] Test flashcard flow

## Post-Deployment

### 1. User Communication
- [ ] Share `QUICKSTART_PHASE9.md` with users
- [ ] Announce new features
- [ ] Provide migration instructions

### 2. Monitoring
- [ ] Check Vercel/Netlify analytics
- [ ] Monitor Supabase usage
- [ ] Watch for error reports

### 3. Data Population
- [ ] Expand `neetcode150.json` to full 150 questions
- [ ] Expand `striver_sde.json` to full SDE sheet
- [ ] Verify all slugs match LeetCode URLs

## Rollback Plan

If issues occur:

### 1. Code Rollback
```bash
git revert HEAD
git push origin main
```

### 2. Database Rollback
```sql
-- Run in Supabase SQL Editor
DROP TABLE IF EXISTS snippets;
ALTER TABLE questions DROP COLUMN IF EXISTS slug;
ALTER TABLE questions DROP COLUMN IF EXISTS flashcard_touch;
ALTER TABLE questions DROP COLUMN IF EXISTS flashcard_next_review;
```

### 3. Verify Rollback
- [ ] Old version deploys successfully
- [ ] Existing features still work
- [ ] No data loss

## Known Issues & Workarounds

### Issue: JSON files not loading
**Symptom**: Data page shows "No questions"
**Fix**: Check that JSON files are in `src/data/` and imported correctly

### Issue: Flashcards not appearing
**Symptom**: "No flashcards due today" despite having notes
**Fix**: Check `next_review_date` in database, ensure it's today or earlier

### Issue: Migration fails
**Symptom**: SQL errors when running migration
**Fix**: Check if columns already exist, use `IF NOT EXISTS` clauses

## Success Criteria

Phase 9 deployment is successful if:
- ✅ All new pages load without errors
- ✅ Users can create snippets
- ✅ Flashcard review works
- ✅ Data page shows progress
- ✅ Mobile experience is smooth
- ✅ No increase in error rate
- ✅ Database queries perform well

## Next Phase Planning

After Phase 9 is stable:
- [ ] Plan dashboard integration
- [ ] Design AI plan generation
- [ ] Implement question assignment
- [ ] Add midnight cutoff logic

## Support Resources

- **Feature Guide**: `PHASE9_FEATURES.md`
- **Quick Start**: `QUICKSTART_PHASE9.md`
- **Implementation Status**: `IMPLEMENTATION_STATUS.md`
- **Summary**: `PHASE9_SUMMARY.md`

## Emergency Contacts

- **Database Issues**: Check Supabase dashboard
- **Build Issues**: Check Vercel/Netlify logs
- **Code Issues**: Review TypeScript diagnostics

---

**Deployment Date**: _____________
**Deployed By**: _____________
**Production URL**: _____________
**Rollback Tested**: ☐ Yes ☐ No

## Sign-Off

- [ ] All checklist items completed
- [ ] Production tested
- [ ] Documentation updated
- [ ] Users notified
- [ ] Monitoring in place

**Approved By**: _____________
**Date**: _____________
