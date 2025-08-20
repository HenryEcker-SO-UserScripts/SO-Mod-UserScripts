import {SystemReasonIdList, type UserDefinedMessageTemplate} from './ModMessageTypes';
import {$boolean, $enum, $number, $object, $opt, $string} from 'lizod';

const validateTemplate = $object({
    TemplateName: $string,
    TemplateBody: $string,
    AnalogousSystemReasonId: $enum(SystemReasonIdList),
    DefaultSuspendDays: $opt($number),
    StackOverflowOnly: $opt($boolean),
    IncludeSuspensionFooter: $opt($boolean),
    SuspensionFooter: $opt($string),
    Header: $opt($string),
    Footer: $opt($string),
});

function validateTemplateArray(maybeTemplateArray: unknown[]): maybeTemplateArray is UserDefinedMessageTemplate[] {
    if (maybeTemplateArray.every(t => {
        const ctx: { errors: ((string | symbol | number)[])[]; } = {errors: []};
        const result = validateTemplate(t, ctx);
        if (ctx.errors.length > 0) {
            console.error('Validation Error', ctx);
        }
        return result;
    })) {
        return true;
    }
    StackExchange.helpers.showToast('Unable to parse template import. See console error for more details', {
        type: 'danger',
        transient: true,
        transientTimeout: 4e3
    });
    // console.error('Validation Failure', ctx);
    return false;
}

class TemplateManager {
    private readonly templates: UserDefinedMessageTemplate[];
    private readonly GM_Store_Key = 'ModMessageTemplates';

    constructor() {
        this.templates = GM_getValue<UserDefinedMessageTemplate[]>(this.GM_Store_Key, []);
    }

    get customMessageTemplates() {
        return this.templates;
    }

    getCustomMessageTemplateByReasonId(reasonId: string): UserDefinedMessageTemplate[] {
        return this.templates.filter(x => {
            return x.TemplateName.localeCompare(reasonId) === 0;
        });
    }

    async importTemplate(jsonString: string): Promise<boolean> {
        try {
            let maybeTemplateArray: unknown[] = JSON.parse(jsonString);
            if (!Array.isArray(maybeTemplateArray)) {
                maybeTemplateArray = [maybeTemplateArray];
            }
            if (!validateTemplateArray(maybeTemplateArray)) {
                return false;
            }
            for (const newTemplate of maybeTemplateArray) {
                const v = this.templates.findIndex(t => t.TemplateName === newTemplate.TemplateName);
                if (v !== -1) {
                    const shouldReplace = await StackExchange.helpers.showConfirmModal({
                        title: 'Duplicate Template Found',
                        bodyHtml: `<div><p>The template "${newTemplate.TemplateName}" already exists.</p><p>Do you want to overwrite the existing template with the import?</p></div>`,
                        buttonLabel: 'Overwrite'
                    });
                    if (shouldReplace) {
                        this.templates[v] = newTemplate;
                    }
                } else {
                    this.templates.push(newTemplate);
                }
            }
            GM_setValue(this.GM_Store_Key, this.templates);
            return true;

        } catch (SyntaxError) {
            StackExchange.helpers.showToast('Invalid JSON!', {type: 'danger', transient: true, transientTimeout: 2e3});
        }
        return false;
    }
}


export default new TemplateManager();