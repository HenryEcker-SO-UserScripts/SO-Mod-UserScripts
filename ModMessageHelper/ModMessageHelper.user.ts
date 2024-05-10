interface ModMessageTemplate {
    ModMessageReason: number;
    IsCommunityTeamMessage: boolean;
    DefaultSuspensionReason: string;
    TemplateName: string;
    TemplateBody: string;
    DefaultSuspendDays: number;
    IncludeSuspensionFooter: boolean;
    SuspensionFooter: string;
    Header: string;
    Footer: string;
}

interface TemplateRequestResponse {
    AboutUserId: number;
    AboutUserUrl: string; // URL
    IsCommunityTeamMessage: boolean;
    MessageTemplate: ModMessageTemplate;
}

// To create run the following code with no UserScripts running
// console.log($('#select-template-menu option').map((_, n) => `'${$(n).val()}'`).toArray().slice(1).join('|\n'))
type SystemReasonId = 'LowQualityQuestions' |
    'QuestionRepetition' |
    'SockPuppetVoting' |
    'TargetedVotes' |
    'AbusiveToOthers' |
    'RevengeDownvoting' |
    'SelfDestructionOfUsefulContent' |
    'SignaturesOrTaglines' |
    'ExcessiveSelfPromotion' |
    'ExcessiveDiscussionInComments' |
    'Plagiarism' |
    'RollbackWar' |
    'InappropriateUsername' |
    'BanEvasionMultipleAccounts' |
    'InaccurateAIContent' |
    'SpamRecidivism' |
    'OtherViolation';

type UserDefinedMessageTemplate =
    Partial<ModMessageTemplate>
    & Pick<ModMessageTemplate, 'TemplateName' | 'TemplateBody'>
    & {
    StackOverflowOnly?: boolean;
    AnalogousSystemReasonId: SystemReasonId; // This is attached to the suspendReason hidden field and is used to look up the suspension banner text
};

type AjaxSuccess = (data: TemplateRequestResponse, status: string, jqXHR: JQuery.jqXHR) => void;

StackExchange.ready(function () {
    if (!StackExchange?.options?.user?.isModerator) {
        return;
    }

    const parentUrl = StackExchange?.options?.site?.parentUrl ?? location.origin;
    const parentName = StackExchange.options?.site?.name;

    const customModMessages: UserDefinedMessageTemplate[] = [
        {
            AnalogousSystemReasonId: 'SelfDestructionOfUsefulContent',
            TemplateName: 'Vandalism (OpenAI protest)',
            DefaultSuspendDays: 30,
            IncludeSuspensionFooter: true,
            TemplateBody: `It has come to our attention that you've removed or otherwise defaced some of your content in a manner that appears related to the recent announcement of Stack Exchange's partnership with OpenAI.

We, the [volunteer community moderators](${parentUrl}/help/site-moderators), believe this is misguided. Our assumption is that Stack Overflow's content has long since been fed into many AI large language models (LLMs) already, [probably including the model powering ChatGPT](https://ai.stackexchange.com/a/38663), and nothing you or we do (or don't do) will change that.

Thus, by destroying the copy that exists here, you are primarily harming two groups of people: 1) people who need answers to questions, search Stack Overflow for them, and find your posts, and 2) the volunteer moderators and curators who work to preserve Stack Overflow as a resource for others in the community.  LLM users will continue to be able to access answers regardless.

We want Stack Overflow to remain a useful source of information for people who want vetted answers from humans. You may be assured that this is something we are willing to defend. When company policy threatened this, [we went on strike](https://meta.stackexchange.com/q/389811).

While we are working to get further clarity and better public messaging, it is our current understanding (based on [this official statement from Stack Exchange](https://meta.stackexchange.com/a/399630)) that these agreements are a way to work with companies using Stack Exchange data to provide appropriate attribution (as per [the CC by-SA license](${parentUrl}/help/licensing)), rather than simply providing answers without attribution, as many do today.

If you nonetheless wish to delete your account, please see [How do I delete my account?](https://meta.stackexchange.com/help/deleting-account). For requests regarding your personal data, use the [Stack Exchange Privacy Webform](https://policies.stackoverflow.co/data-request/); however, note that questions, answers, comments and other non-personally identifiable content posted on the site are not, generally, covered by privacy regulations like GDPR.  For general questions for staff, you can use the [contact form](${parentUrl}/contact).

If there is something we've misunderstood about your actions, please let us know by replying to this message on the website.`
        },
        {
            AnalogousSystemReasonId: 'LowQualityQuestions',
            TemplateName: 'low quality answers',
            DefaultSuspendDays: 0,
            DefaultSuspensionReason: 'because of low-quality contributions',
            TemplateBody: `One or more of your answers do not meet the quality standards of the site and have been deleted.

Common [reasons for deletion](${parentUrl}/help/deleted-answers) include:

- Answers that do not address the original question
- Answers that contain incorrect information and do not appear to be your own original work
- Answers that consist primarily of a link to an answer elsewhere
- Answers in a language other than English
- Answers that contain code, data, or other text in images that does not also appear as text

To review your deleted answers, please visit your ["deleted answers" page](${parentUrl}/users/deleted-answers/current). The link can also be found at the bottom of the [answers tab](${parentUrl}/users/current?tab=answers) on your profile.

If you believe a specific answer should not have been deleted, you can flag the post with an "*In need of moderator intervention*" flag and provide an explanation.`,
        },
        {
            AnalogousSystemReasonId: 'OtherViolation',
            TemplateName: 'closing spam',
            DefaultSuspendDays: 0,
            TemplateBody: `As you may have noticed, ${parentName} is currently under a spam wave, receiving a lot of "support number" spam posts.

While we appreciate your willingness to help us out with these as you see them, we noticed that you recently voted to close one or more of these questions. That is not very useful. **Instead of voting to close spam, you should flag it as spam.** You'll find that option at the very top of the "flag" dialog.

Flagging as spam is much more expedient than voting to close, and actually allows spam to be nuked from the site without moderator intervention even being required.

Thank you for your attention to this matter in the future. If you have any questions, please let us know!`,
        },
        {
            AnalogousSystemReasonId: 'OtherViolation',
            TemplateName: 'soliciting votes',
            DefaultSuspendDays: 0,
            TemplateBody: `We noticed that you've been posting numerous comments asking other users for upvotes and/or accepts. This is not an appropriate use of comments.

Quoting from the [comment privilege page](${parentUrl}/help/privileges/comment):

> You should submit a comment if you want to:
> * Request **clarification** from the author;
> * Leave **constructive criticism** that guides the author in improving the post;
> * Add relevant but **minor or transient information** to a post (e.g. a link to a related question, or an alert to the author that the question has been updated).

Please refrain from leaving comments urging users to accept answers in the future. Such comments may be perceived as begging by other users. The system does have built-in contextual help that recommends new users accept an answer to their question at an appropriate time. Having the message come from the software itself, rather than a comment from a specific user, is preferable for several reasons:

First, it reduces the amount of noise on the site, since the message is displayed only on that user's screen, not as content that every future viewer to the Q&A will see. Second, it eliminates the possibility that your comment comes across as pressuring the user into accepting and/or upvoting your post. The reality is, no matter how politely and neutrally you phrase the comment, if you have also posted an answer to the question, the receiving user is extremely likely to interpret that comment as pressuring them to accept your answer.

In the best case, comments like these are merely noise, redundant with system-level notifications; in the worst case, they may be perceived as an attempt to pressure someone to do something that is, after all, completely optional.`,
        },
        {
            AnalogousSystemReasonId: 'OtherViolation',
            TemplateName: 'author minor edits bumping post',
            DefaultSuspendDays: 3,
            TemplateBody: `You appear to be editing your post to attract attention, rather than to improve it. Periodic cosmetic edits are not constructive and needlessly bump your post, displacing actually active posts that require more community attention. To quote the Help Center [How does editing work?](${parentUrl}/help/editing):

> **Tiny, trivial edits are discouraged**; try to make the post significantly better when you edit, correcting all problems that you observe.

Please only edit your post to correct errors, to include additional insights, or to update the question for changing circumstances. If you continue to only edit it for cosmetic reasons only, we'll have to lock your post from all further edits.`,
        },
        {
            AnalogousSystemReasonId: 'OtherViolation',
            TemplateName: 'minor/trivial suggested edits',
            DefaultSuspendDays: 3,
            TemplateBody: `We have noticed that your recent suggested edits are just correcting a typo in the title and haven't handled any of the other problems with a question. Please note that we expect suggested edits to fix all issues with a post, rather than correcting only a single thing. To quote the Help Center [How does editing work?](${parentUrl}/help/editing):

> **Tiny, trivial edits are discouraged**; try to make the post significantly better when you edit, correcting all problems that you observe.

Do keep in mind to clean up all the problems with the post, while you are proposing edits to it. Suggested edits must also be approved by at least two other users prior to being accepted. We therefore ask users to only make edits which make substantial improvements to posts.

Your ability to suggest edits has been revoked for {suspensionDurationDays} days. We encourage you to use this time to review the [relevant guidelines](${parentUrl}/help/editing) about how to edit posts.`,
        },
        {
            AnalogousSystemReasonId: 'Plagiarism',
            TemplateName: 'tag-wiki plagiarism',
            DefaultSuspendDays: 0,
            TemplateBody: `It has come to our attention that your recent suggested tag wiki edits consisted primarily or entirely of text copied from other websites. We prefer not to simply copy content already available elsewhere in lieu of creating something that adds value to this site, and where possible we prefer that content be your own original work.

Please note that we still require full attribution with a link to the external source, and citing the name of the original author if you are quoting an excerpt. You should also make an effort to seek permission before copying content.

Thank you, and we look forward to your contributions in the future.`,
        },
        {
            AnalogousSystemReasonId: 'OtherViolation',
            TemplateName: 'gold badge abuse (redupe to add answer)',
            DefaultSuspendDays: 0,
            TemplateBody: `We have noticed you have used your gold badge privilege to reopen a question closed as duplicate, answer it, and immediately close it again.

- <!-- {todo} Add examples of question(s) that user have reopened -->

Please note that this is not how you are supposed to use a gold tag badge.

As you may know, gold badges grant the privilege to single-handedly close and reopen questions as duplicates. This is unlocked after reaching a demanding threshold of answer score in a certain tag and number of answers, under the assumption that you can be **trusted to**:

- recognize when a question is a duplicate of another one, and close it accordingly;
- recognize when a question that is already closed as duplicate is not a duplicate, and reopen it accordingly

By reopening a duplicate with your gold badge you are essentially saying: "this question is not a duplicate and was incorrectly closed". You can answer a question that you reopen this way. However if you immediately proceed to re-close it against the same canonical, we must question your original motivations for reopening. In fact, it doesn't look good at all because you are effectively **disallowing answers to that question except yours**, and **going against others' curation efforts to self-serve your contribution**.

There are a few other appropriate actions that we ask you to consider:

- If you think that the question is not a duplicate, just leave it open. You may add links to other Q&As that are related or complement your own answer.

- If you think that the question is a duplicate, then just leave it closed. If you think the asker might have a hard time understanding how the canonical applies to their question, you may leave an explanatory comment.

- If you think that the question is a duplicate but the available canonical has inadequate answers, you either close as duplicate and then post a new answer to the canonical; or you answer this question and close the canonical as duplicate of this question, and this question becomes the new canonical.`,
        },
        {
            AnalogousSystemReasonId: 'OtherViolation',
            TemplateName: 'gold badge abuse (reopen when answered)',
            DefaultSuspendDays: 0,
            TemplateBody: `We have noticed you have used your gold badge privilege to reopen a question others have closed as duplicate, when you have a stake in the question.

- <!-- {todo} Add examples of question(s) that user have reopened -->

Please note that this is not how you are supposed to use a gold tag badge.

As you may know, gold badges grant the privilege to single-handedly close and reopen questions as duplicates. This is unlocked after reaching a demanding threshold of answer score in a certain tag and number of answers, under the assumption that you can be **trusted to**:

- recognize when a question is a duplicate of another one, and close it accordingly;
- recognize when a question that is already closed as duplicate is not a duplicate, and reopen it accordingly

By reopening a duplicate with your gold badge you are essentially saying: "this question is not a duplicate and was incorrectly closed". However if you had a stake in the question and later you or others have to re-vote to close the question against the same canonical, we must question your original motivations for reopening. In fact, it doesn't look good at all because you are effectively **going against others' curation efforts to self-serve your contribution**.

There are a few other appropriate actions that we ask you to consider:

- If you think that the question is not a duplicate when **you have already answered the question**, we request that you raise a reopen discussion on [Meta](${parentUrl}/questions/ask?tags=discussion+specific-question+duplicate-questions).`,
        },
        {
            AnalogousSystemReasonId: 'OtherViolation',
            TemplateName: 'reset inappropriate username',
            DefaultSuspendDays: 0,
            TemplateBody: `We have received reports that your username may be considered offensive to some members of our community. Our [Code of Conduct](${parentUrl}/conduct) requires that all usernames be appropriate for professional discourse and in keeping with our community standards.

As a result we have reset your username to the default setting. We kindly request that you do not change your username back to the previous one without first consulting with us.

If there has been any misunderstanding regarding the meaning of the username you used, please feel free to reach out to us and provide clarification by responding to this message. Additionally, if you would like to change your username to something else that is appropriate and are experiencing any issues in doing so, please let us know and we will be happy to assist.

Thank you for your understanding and cooperation.`,
        },
        {
            AnalogousSystemReasonId: 'OtherViolation',
            TemplateName: 'account sharing',
            DefaultSuspendDays: 0,
            TemplateBody: `Company-owned or accounts shared by multiple users are not permitted as stated in the [Terms of Service](${parentUrl}/legal/terms-of-service/public):

> To access some of the public Network features you will need to **register for an account as an individual** and consent to these Public Network Terms. If you do not consent to these Public Network Terms, ${parentName} reserves the right to refuse, suspend or terminate your access to the public Network.

As this account appears to be in breach of this policy, it will be deleted. You are welcome to register again for an account as an individual user, subject to the Terms of Service.

Should you wish to appeal this decision, you can use the [Contact Us](${parentUrl}/contact) form and explaining your situation to the Community Management Team.`,
        },
        {
            AnalogousSystemReasonId: 'OtherViolation',
            StackOverflowOnly: true, // because template has SO-only meta links
            TemplateName: 'ban evasion, multiple accounts',
            DefaultSuspendDays: 7,
            TemplateBody: `It has come to our attention that you have been using multiple accounts to work around system limitations. The extra accounts will be removed together with any unanswered questions. Please refrain from using secondary accounts to circumvent our systems in the future.

All system and moderator-imposed limits/blocks/bans/suspensions/etc. apply to the user, not just a single account. You are not permitted to create one or more new accounts in order to get around such limitations. If you are hitting a limit on one account, then you should act as if you were hitting that limit on each of your accounts.

The most common limitations for people to attempt to evade are the system imposed question and answer bans. When you're getting the message 'We are no longer accepting questions/answers from this account', then you should act as if you are getting that message on all of your accounts and not post additional questions or answers (whichever you're hitting), even if you have an alternate account which is not banned. For more detail about question and answer bans and what you can do to get out of them, please see [What can I do when getting “We are no longer accepting questions/answers from this account”?](https://meta.stackoverflow.com/a/255584#255584)

Having more than one account is permitted, if the additional account is not used to circumvent such limitations and the accounts do not interact with each other, or otherwise allow you to do things which you would not be permitted to do with a single account. If you are interested in more information about having more than one account, please see [What are the rules governing multiple accounts (i.e. sockpuppets)?](https://meta.stackoverflow.com/q/388984).`,
        },
        {
            AnalogousSystemReasonId: 'OtherViolation',
            StackOverflowOnly: true, // because template has SO-only meta links
            TemplateName: 'question repetition, multiple accounts',
            DefaultSuspendDays: 7,
            TemplateBody: `It has been called to our attention that you have asked the same question from multiple accounts. The extra accounts will be removed together with any unanswered questions. Please refrain from using secondary accounts to circumvent our systems in the future.

If your question was closed or did not attract responses, then the first thing to do is to *improve the question*; some guidance for this is [given here](https://stackoverflow.com/help/how-to-ask). Questions that aren’t up to standards are voted on and may be closed: this doesn’t mean they’re gone forever, as they can be reopened if improved or clarified (as appropriate). Please see our [editing](https://stackoverflow.com/editing-help) guidelines for how to improve your question.

However, please do not keep re-asking the same question. If your ability to ask questions has been suspended, do not create new accounts to circumvent our systems; this will result in increasingly longer suspensions being applied. Having more than one account is permitted, if the additional account is not used to circumvent such limitations and the accounts do not interact with each other, or otherwise allow you to do things which you would not be permitted to do with a single account. If you are interested in more information about having more than one account, please see [What are the rules governing multiple accounts (i.e. sockpuppets)?](https://meta.stackoverflow.com/q/388984)`,
        },
        {
            AnalogousSystemReasonId: 'OtherViolation',
            StackOverflowOnly: true, // because template has SO-only meta links
            TemplateName: 'demands to show effort/not a code-writing service',
            DefaultSuspendDays: 0,
            TemplateBody: `It has come to our attention that you've left one or more comments similar to the following:

> Please show some effort. This is not a code-writing service.

[Stack Overflow *is* a code-writing service](https://meta.stackoverflow.com/a/408565), in the sense that it is a programming Q&A site, and most questions here are solved by writing code in the answer. It is [not a debugging helpdesk for askers](https://meta.stackexchange.com/a/364585)&mdash;we do not require that askers provide existing code to debug. Lack of problem-solving effort is not a reason to close or otherwise object to questions. [The only type of effort we require is the effort required to ask a clear, focused, non-duplicate question](https://meta.stackoverflow.com/a/260909). Including an attempt often adds noise and results in answers that are applicable to just the original asker, rather than anyone doing the same thing.  Many of the most useful questions on the site do not include an existing attempt at solving the problem.

Of course, Stack Overflow is *also* not a free application design and development service. Questions may still be closed as too broad (or unclear) if that is the problem. But please do not try to limit the questions asked here to problems with *existing* code. Instead, focus on the scope and clarity of questions. The goal should be to encourage questions that might help the next person with the same problem.

Please do not post any more of these comments. They add noise for moderators to remove, may be perceived as demanding or unfriendly, and don't assist with our goal of creating a knowledge base. Please vote to close questions that you think are off-topic, unclear, or otherwise not appropriate for Stack Overflow.`,
        },
        {
            AnalogousSystemReasonId: 'OtherViolation',
            StackOverflowOnly: true, // because template has SO-only meta links
            TemplateName: 'self tag burnination',
            DefaultSuspendDays: 7,
            TemplateBody: `As you should be aware, there is [a process for mass tag removal](https://meta.stackoverflow.com/q/324070), also known as burnination. The [policy from Stack Exchange](https://meta.stackoverflow.com/q/356963) is that the process **must** be followed and that burninations of tags which are used on more than 50 questions **must** be discussed on Meta Stack Overflow *prior* to beginning to edit to remove the tag.

You have recently removed many tags from questions without following the burnination process. Do not do that. This message is a warning. If you do this again, with this or any other tag, then there will be further consequences.

The edits you made will be reverted. Some of the edits have other beneficial changes, which you are welcome to reapply. However, you are not permitted to systematically remove tags from questions without following the burnination process.`,
        },
        {
            AnalogousSystemReasonId: 'Plagiarism',
            StackOverflowOnly: true, // because template has SO-only meta links
            TemplateName: 'mass plagiarism',
            DefaultSuspendDays: 7,
            IncludeSuspensionFooter: false,
            TemplateBody: `It has come to our attention that some of your answers contain text copied from other answers or websites without giving credit to the source of the text.  This is considered plagiarism, and it is a violation of our Terms of Service and the license agreement.

You are not allowed to copy content already available elsewhere and claim it as your own.  That is, you must _at least_ provide [clear attribution](${parentUrl}/help/referencing).

**Posts containing content from other sources must:**

  - Include the name of the original author.
  - Include a link to the original source.
  - Make it clear (using [quote formatting](${parentUrl}/editing-help#simple-blockquotes)) **which parts of the answer are copied, and from where.** *Just putting a link to the original source somewhere in the post is not enough*, because it does not make it clear that it is the source of the content.  For more information, see [this answer](https://meta.stackoverflow.com/a/321326).
  - Add your own content to the post.  It should not be entirely (or almost entirely) copied content.

Even if you change some of the wording or code a bit, you still must credit the original source.  As a general rule, if it's recognizable when you compare the two side-by-side, it needs to give credit.

Any answers that we found with copied content that did not reference its source have been deleted.  If you wish to review them, you can view the [list of all of your deleted answers](${parentUrl}/users/deleted-answers/current) (which may also have answers deleted for other reasons).  If you have other answers that do not properly credit their sources, and you want to avoid them being removed, please edit them to follow the above requirements.

<!-- {todo} Remove if not suspending -->

Due to the large number of plagiarized posts (requiring large amounts of volunteer moderator time to check), **your account has been temporarily suspended for {suspensionDurationDays} days.** While you're suspended, your reputation will show as 1 but will be restored once the suspension ends.

<!-- {todo} Remove the following if not bulk deleting -->

Due to the large percentage of plagiarized content, we have also opted to delete many of your answers that we were not able to check for copied content in a reasonable amount of time. While there may be some of your answers that were not plagiarized, we simply don't have the time to check every individual answer that you have posted to this site.

If there are specific answers of yours that you believe were not plagiarized (that is, they are your own, original work), and you would like to have these specific answers undeleted, you may reply to this message with a list of such answers, or raise an "In need of moderator intervention" flag on the answers with an explanation. We will verify those individual answers and consider them for undeletion.`,
        },

        {
            AnalogousSystemReasonId: 'ExcessiveSelfPromotion',
            StackOverflowOnly: true, // because template has SO-only meta links
            TemplateName: 'promotional content; answers not self-contained',
            DefaultSuspendDays: 0,
            // The \n characters used below are to get around a Tampermonkey default setting which automatically removes trailing whitespace from changed lines.
            TemplateBody: `**Promotional content:**  \nWe noticed that at least some of your posts seem to promote and/or link to a product, website, blog, library, YouTube channel/videos, project, source code repository, etc. Per the [help center](${parentUrl}/help/behavior):

> Be careful, because the community frowns on overt self-promotion and tends to vote it down and flag it as spam. Post good, relevant answers, and if some (but not all) happen to be about your product or website, so be it. However, you _must_ disclose your affiliation in your answers. Also, if a huge percentage of your posts include a mention of your product or website, you're probably here for the wrong reasons. Our advertising rates are quite reasonable; [contact our ad sales team for details](${parentUrl}/advertising).

You should also review the content at the following links:

- [**What signifies "Good" self promotion?**](https://meta.stackexchange.com/q/182212),
- [some tips and advice about self-promotion](${parentUrl}/help/promotion),
- [What is the exact definition of "spam" for Stack Overflow?](https://meta.stackoverflow.com/q/260638), and
- [What makes something spam](https://meta.stackexchange.com/a/58035).

Any type of "astroturfing" promotion is not acceptable, regardless of if it's for profit or not. It brings down the overall value of genuine content and recommendations for everyone on the site.

If you do include a link to something, then the link needs to be directly relevant to the question and/or answer (i.e. a specific page that is about the issue(s) in the question and/or answer). It should not be just a general link to your site, product, blog, YouTube channel, etc. If the link is to something you are affiliated with, then you _must_ include explicit disclosure of your affiliation in your post, unless the link is to official documentation for a product/library that is explicitly asked about in the question.

**Answers must be a self-contained answer to the question:**  \nYour answers need to be actual, complete answers to the question. Just a link to something off-site doesn't make for an answer. [Answers must actually answer the question](https://meta.stackexchange.com/q/225370), without requiring the user to click to some other site to get enough information to solve the problem / answer the question. Please [add context around links](https://meta.stackoverflow.com/a/8259). _[Always quote](${parentUrl}/help/referencing) the most relevant part of an important link, in case the target site is unreachable or goes permanently offline._ If you are linking to a library or framework, then [explain _why_ and _how_ it solves the problem, _and provide code on how to use it_](https://meta.stackoverflow.com/a/251605). Take into account that being _barely more than a link to an external site_ is a reason as to [Why and how are some answers deleted?](${parentUrl}/help/deleted-answers).`,
        },
        {
            AnalogousSystemReasonId: 'OtherViolation',
            TemplateName: 'voluntary suspension',
            TemplateBody: `We have temporarily suspended your account for {suspensionDurationDays} days upon request.

Since this suspension is fully voluntary, you are welcome to reply to this message and request that the suspension be lifted early. Otherwise it will automatically expire in {suspensionDurationDays} days, upon which time your full reputation and privileges will be restored.

We wish you a pleasant vacation from the site, and we look forward to your return!`,
            IncludeSuspensionFooter: false,
            Footer: '',
        }
    ];


    class ModMessageForm {
        readonly blankTemplateOptionValue = '0';
        private readonly systemTemplateReasonIds: Set<string>;

        constructor() {
            this.systemTemplateReasonIds = new Set([...(<JQuery<HTMLOptionElement>>this.$templateSelector.find('option')).map((_, n) => <string>$(n).val())]);
        }

        get $form(): JQuery<HTMLFormElement> {
            return $('#js-msg-form');
        }

        get $messageContents(): JQuery<HTMLDivElement> {
            return $('#js-message-contents');
        }

        get $aboutUserId(): JQuery<HTMLInputElement> {
            return $('.js-about-user-id[name="userId"]');
        }

        get aboutUserId(): number {
            return Number(this.$aboutUserId.val());
        }

        get $templateSelector(): JQuery<HTMLSelectElement> {
            return $('#select-template-menu');
        }

        get reasonId(): string {
            return <string>this.$templateSelector.val();
        }

        set reasonId(newOptionValue: string) {
            this.$templateSelector.val(newOptionValue);
        }

        get $suspendReasonInput(): JQuery<HTMLInputElement> {
            return $('#usr-js-suspend-reason');
        }

        get suspendReason(): string {
            return <string>this.$suspendReasonInput.val();
        }

        set suspendReason(newSuspendReason: string) {
            this.$suspendReasonInput.val(newSuspendReason);
        }

        get displayedSelectedTemplate(): string {
            return this.$templateSelector.find('option:selected').text();
        }

        get $customTemplateNameInput(): JQuery<HTMLInputElement> {
            // This html id is defined in attachTemplateNameInputField
            return $('#usr-template-name-input');
        }

        get customTemplateName(): string {
            return <string>this.$customTemplateNameInput.val();
        }

        set customTemplateName(newTemplateName: string) {
            this.$customTemplateNameInput.val(newTemplateName);
        }

        get $suspensionOptions(): JQuery<HTMLFieldSetElement> {
            return $('#suspension-options');
        }

        get $suspensionDays(): JQuery<HTMLInputElement> {
            return $('.js-suspension-days[name="suspendDays"]');
        }

        get suspendDays(): number {
            return Number(this.$suspensionDays.val());
        }

        get $editor(): JQuery<HTMLTextAreaElement> {
            return $('#wmd-input');
        }

        get editorText(): string {
            return <string>this.$editor.val();
        }

        set editorText(newText: string) {
            this.$editor.val(newText);
        }

        refreshEditor() {
            // Refresh previews
            // @ts-expect-error MarkdownEditor is not in StackExchange Type
            StackExchange.MarkdownEditor.refreshAllPreviews();
        }

        get $autoSuspendMessageField(): JQuery<HTMLInputElement> {
            return $('#js-auto-suspend-message');
        }

        get autoSuspendMessageTemplateText(): string {
            return <string>this.$autoSuspendMessageField.val();
        }

        set autoSuspendMessageTemplateText(newValue: string) {
            this.$autoSuspendMessageField.val(newValue);
        }

        isSystemTemplate(reasonId?: string): boolean {
            return this.systemTemplateReasonIds.has(reasonId ?? this.reasonId);
        }

        hasTemplateSelected(): boolean {
            return this.reasonId !== this.blankTemplateOptionValue;
        }

        hasCustomTemplateName(): boolean {
            return this.displayedSelectedTemplate !== this.customTemplateName;
        }
    }

    const ui = new ModMessageForm();

    function attachTemplateNameInputField() {
        const customTemplateDivHiddenClass = 'd-none';

        // Get rid of the name field of the template selector dropdown
        // Use the input field for this value instead
        ui.$templateSelector.removeAttr('name');

        const $customTemplateDiv =
            $(`<div class="${customTemplateDivHiddenClass} d-flex gy4 fd-column mb12"></div>`)
                .append('<label class="flex--item s-label">Template Name</label>')
                .append('<input id="usr-template-name-input" name="templateName" class="flex--item s-input wmx4" maxlength="272">');

        ui.$messageContents.before($customTemplateDiv);

        // populate this field with the display text
        ui.$templateSelector.on('change', (e: JQuery.ChangeEvent<HTMLSelectElement>) => {
            if (!e.target.options[e.target.selectedIndex]) {
                // Don't do anything if there's no selected index (some error in selection happened)
                return;
            }
            ui.customTemplateName = e.target.options[e.target.selectedIndex].text;

            // Only show custom template name input field when template has been selected
            if (ui.hasTemplateSelected()) {
                $customTemplateDiv.removeClass(customTemplateDivHiddenClass);
            } else {
                $customTemplateDiv.addClass(customTemplateDivHiddenClass);
            }
        });

        // Prevent enter key press in template name field from submitting form
        ui.$customTemplateNameInput.on('keydown', (ev: JQuery.KeyDownEvent<HTMLInputElement>) => {
            if (ev.key === 'Enter') {
                ev.preventDefault();
                return false;
            }
            return true;
        });
    }

    function attachSuspendReasonHiddenField() {
        ui.$form.append('<input type="hidden" name="suspendReason" id="usr-js-suspend-reason"/>');
    }

    function createReasonOption(newOptionValue: string): JQuery<HTMLOptionElement>;
    function createReasonOption(newOptionValue: string, newOptionText: string): JQuery<HTMLOptionElement>;
    function createReasonOption(newOptionValue: string, newOptionText?: string): JQuery<HTMLOptionElement> {
        return $(`<option value="${newOptionValue}">${newOptionText ?? newOptionValue}</option>`);
    }

    function addReasonsToSelect() {
        const isStackOverflow = parentUrl === 'https://stackoverflow.com';

        const reasonsToAdd: string[] = customModMessages
            .reduce((acc, message) => {
                // If is a StackOverflowOnly Template and this is not Stack Overflow don't include in result
                if (message?.StackOverflowOnly === true && !isStackOverflow) {
                    return acc;
                }

                acc.push(message.TemplateName);

                return acc;
            }, []);

        if (reasonsToAdd.length === 0) {
            return; // Don't make any changes if there are no custom templates
        }

        // Move default templates into an optgroup (excluding value blankTemplateOptionValue which is "Please select a template..."
        ui.$templateSelector.find(`option[value!="${ui.blankTemplateOptionValue}"]`).wrapAll('<optgroup label="Stock Templates"></optgroup>');

        // Create new optgroup with custom templates
        ui.$templateSelector.append(
            $('<optgroup label="Custom Templates"></optgroup>')
                .append(...reasonsToAdd.map(reasonId => createReasonOption(reasonId)))
        );
    }

    function checkForURLSearchParams() {
        const reasonIdParam = new URLSearchParams(window.location.search).get('reasonId');
        if (reasonIdParam) {
            ui.reasonId = reasonIdParam;
            // Trigger a change event to notify the change listener in attachTemplateNameInputField
            ui.$templateSelector.trigger('change');
        }
    }

    function fixAutoSuspendMessagePluralisation() {
        ui.$suspensionOptions.on('change', () => {
            // Update Auto Suspend Template value to correctly pluralise suspend days
            ui.autoSuspendMessageTemplateText = ui.autoSuspendMessageTemplateText.replace(
                /\$days\$ days?/,
                ui.suspendDays === 1 ? '$days$ day' : '$days$ days'
            );
            // Force Editor to rerender with new template values
            ui.refreshEditor();
        });
    }

    function setupProxyForNonDefaults() {
        $.ajaxSetup({
            beforeSend: (jqXHR, settings) => {
                // If not a request for an admin template do nothing
                if (!settings?.url?.startsWith('/admin/template/')) {
                    return;
                }

                const url = new URL(settings.url, location.origin);

                // If this isn't a request for a reasonId do nothing
                if (!url.searchParams.has('reasonId')) {
                    return;
                }

                const reasonId = url.searchParams.get('reasonId');

                // If this is one of the system templates
                if (ui.isSystemTemplate(reasonId)) {

                    // Clear out suspend reason (only needed for custom templates)
                    ui.suspendReason = '';

                    // Create a proxy to fix the paragraph break in the footer
                    // also fixes custom reasons due to the call to an AnalogousSystemReasonId to populate the majority of fields
                    settings.success = new Proxy(settings.success, {
                        apply: (target: AjaxSuccess, thisArg, args: Parameters<AjaxSuccess>) => {
                            const [fieldDefaults] = args;
                            fieldDefaults.MessageTemplate.Footer = fieldDefaults.MessageTemplate.Footer.replace('Regards,\n\n', 'Regards,  \n');
                            Reflect.apply(target, thisArg, args);
                        }
                    });
                    return;
                }
                // Abort the request preemptively (it will fail since reasonId must be a custom reason)
                jqXHR.abort();

                // Find the selected reason in the list of templates
                const templateSearch = customModMessages.filter(x => {
                    return x.TemplateName.localeCompare(reasonId) === 0;
                });

                if (templateSearch.length !== 1) {
                    StackExchange.helpers.showToast('UserScript Message - Template with that name not found!', {type: 'danger'});
                    return;
                }

                const selectedTemplate = templateSearch[0];
                // Make a different request to an analogous system defined reason to populate the majority of the fields
                void $.ajax({
                    type: 'GET',
                    url: url.pathname,
                    data: {
                        reasonId: selectedTemplate.AnalogousSystemReasonId
                    },
                    success: function (fieldDefaults: TemplateRequestResponse) {
                        // Merge returned Values with template specified values
                        fieldDefaults.MessageTemplate = {
                            ...fieldDefaults.MessageTemplate,
                            ...selectedTemplate,
                        };

                        // Set Suspend Reason Field to AnalogousSystemReasonId
                        ui.suspendReason = selectedTemplate.AnalogousSystemReasonId;

                        // Force call the old Success function with updated values
                        (<AjaxSuccess>settings.success)(fieldDefaults, 'success', jqXHR);
                    },
                    error: settings.error
                });
            }
        });
    }

    attachTemplateNameInputField();
    attachSuspendReasonHiddenField();
    addReasonsToSelect();
    checkForURLSearchParams();
    setupProxyForNonDefaults();
    fixAutoSuspendMessagePluralisation();
});
