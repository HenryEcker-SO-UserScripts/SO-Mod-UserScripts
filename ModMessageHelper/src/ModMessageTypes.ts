import ui from './ModMessageForm';

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

export const SystemReasonIdList: string[] = ui.$templateSelector.find('option').map((_, n) => $(n).val()).toArray().slice(1);

export type UserDefinedMessageTemplate =
    Partial<ModMessageTemplate>
    & Pick<ModMessageTemplate, 'TemplateName' | 'TemplateBody'>
    & {
    StackOverflowOnly?: boolean;
    AnalogousSystemReasonId: string | undefined; // This is attached to the suspendReason hidden field and is used to look up the suspension banner text
};

export type AjaxSuccess = (data: TemplateRequestResponse, status: string, jqXHR: JQuery.jqXHR) => void;


export type BooleanString = 'true' | 'false';