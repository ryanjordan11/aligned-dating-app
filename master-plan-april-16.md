# Master Plan Notes (April 16, 2026)

Below is saved verbatim as requested.

---

## User Message (Verbatim)

"Didn't we already do authentication methods? Isn't that done?

And Admin that needs to be done too. I need a whole bunch of stuff there.


Okay, take these as notes. In my admin dashboard, I need an overview. I need to see how many users there are, how many created profiles, how many verified profiles, approved, how many are pending because I need to be able to approve them, the verification queue. I need to have an inbox where I can message the users myself. It's just the admin inbox to set admin sending. I need to see signups versus profiles created, graph. I need to see a list of the users. I need to be able to click and go to their profile public. And then I also need a backend where I could go to their backend profile. I need to see their user ID, their role, their email, when they joined, their name, their age, all the stuff that's in their profile. If they're pending, their location, their IP address, or whatever we have. I need to see their activity, basically their last seen. That's good enough. Their matches, their likes sent, their messages sent. I need to see if they've done posts in their community, how many comments. I need to see, be able to delete them as well, or block them, delete them, et cetera. I should be able to open their messages from there also, I think. And then I need to see who's online, who's currently online. I need a table with all their things. I need to be able to search it. I need to see their last seen, when they joined, to be able to message them right from there. In the verification queue, I need to be able to see everything. Everything they fill out, everything they provide. Yeah, and so it shows I need to be able to check it with lens, the Google lens, and it opens up that. I need to see the prompt that they used. I need to see their email, their name, their type of location, their GPS, or whatever we have on them, everything that we have on them. If it's missing or there's flags, so that I can approve or reject them. Holy, it's going, there's so many signups. Okay, that's what I need in admin area from what I see in our old one. Now, we have the old one that they can refer to also.



No, let's not make vibes the main area. I think it's better to have all the people shown. It's not just about swipe home right now is not vibes. I don't think you need to check this so above I just gave you what I need you can go check the other app to see how it's all set up there, but we're gonna lay out the entire fucking plan and go face my face and get this thing done fucking tonight you g don't fucking go speedy speedy Gonzalez don't fucking assume anything you need to check with me and we make a file on it all so there's no forgetting shit. If you ask me something it goes in that file as the next part of the phase OK you don't change shit without my approval that current file stays as i and then we need to add everything else here after you discuss it with Me Me but you're not you fucking make sure you do this right I had enough"

---

## Assistant Message (Verbatim)

"Auth is partially done: you can sign up/sign in with email+password and Google is wired, but we still have gaps to make it “production-normal” (clean redirects, consistent logout entrypoint on mobile via profile menu, error handling, and making sure onboarding/profile data is always Convex-backed). So no, we’re not done-done yet.

I will not change `next-steps-april-16.md`. I’ll create a second file that becomes the single source of truth for the entire project plan, and everything we discuss gets written into it so nothing is “forgotten” or freestyle.

Proposed new file: `/Users/ryanjordan/IdeaProjects/date2/master-plan-april-16.md`

Before I write it, confirm these so I don’t assume:
1. Auth methods scope: Email+Password + Google only (no Facebook), correct?
2. Admin access rule: only `role in {admin, superadmin}` can access `/app/admin`, correct?
3. Home vs Vibes: Home stays the main area (not Vibes), and Vibes is a separate tab/route, correct?

After you confirm, I’ll write the master plan including your full Admin spec (overview metrics, verification queue with approve/reject, admin inbox, graphs, user table with search, user detail view with activity/matches/likes/messages/community stats, online list, moderation actions)."

