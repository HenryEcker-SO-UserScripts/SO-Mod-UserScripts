export interface ModMessageTemplate {
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

export interface TemplateRequestResponse {
    AboutUserId: number;
    AboutUserUrl: string; // URL
    IsCommunityTeamMessage: boolean;
    MessageTemplate: ModMessageTemplate;
}

// To create run the following code with no UserScripts running
// console.log($('#select-template-menu option').map((_, n) => `'${$(n).val()}'`).toArray().slice(1).join('|\n'))
export type SystemReasonId = 'LowQualityQuestions' |
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

export type UserDefinedMessageTemplate =
    Partial<ModMessageTemplate>
    & Pick<ModMessageTemplate, 'TemplateName' | 'TemplateBody'>
    & {
    StackOverflowOnly?: boolean;
    AnalogousSystemReasonId: SystemReasonId; // This is attached to the suspendReason hidden field and is used to look up the suspension banner text
};

export type AjaxSuccess = (data: TemplateRequestResponse, status: string, jqXHR: JQuery.jqXHR) => void;