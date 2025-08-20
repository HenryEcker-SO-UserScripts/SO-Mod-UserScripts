import {$boolean, $enum, $number, $object, $opt, $string} from 'lizod';
import {SystemReasonIdList, type UserDefinedMessageTemplate} from './ModMessageTypes';

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

    lookupByReasonId(reasonId: string): UserDefinedMessageTemplate[] {
        return this.templates.filter(x => {
            return x.TemplateName.localeCompare(reasonId) === 0;
        });
    }

    async insertOrUpdate(newTemplate: UserDefinedMessageTemplate): Promise<void> {
        const existingTemplateIndex = this.templates.findIndex(t => t.TemplateName === newTemplate.TemplateName);
        // If is a new template
        if (existingTemplateIndex === -1) {
            this.templates.push(newTemplate);
            return;
        }
        // Template already exists
        const shouldReplace = await StackExchange.helpers.showConfirmModal({
            title: 'Duplicate Template Found',
            bodyHtml: `<div><p>The template "${newTemplate.TemplateName}" already exists.</p><p>Do you want to overwrite the existing template with the import?</p></div>`,
            buttonLabel: 'Overwrite'
        });

        // Confirm Dialog Failed
        if (!shouldReplace) {
            return;
        }

        // Overwrite Template with new Template Values
        this.templates[existingTemplateIndex] = newTemplate;
    }

    async importFromJSONString(jsonString: string): Promise<boolean> {
        try {
            let maybeTemplateArray: unknown[] = JSON.parse(jsonString);
            // If whatever was parsed is not already an Array make it one
            if (!Array.isArray(maybeTemplateArray)) {
                maybeTemplateArray = [maybeTemplateArray];
            }
            // Validate All Array Elements to ensure they are all valid Templates
            // If any part of the import is invalid, fail
            if (!validateTemplateArray(maybeTemplateArray)) {
                return false;
            }
            // Import by insert or updating
            for (const newTemplate of maybeTemplateArray) {
                await this.insertOrUpdate(newTemplate);
            }
            // Update GM Store
            GM_setValue(this.GM_Store_Key, this.templates);
            return true;
        } catch (SyntaxError) {
            StackExchange.helpers.showToast('Invalid JSON!', {type: 'danger', transient: true, transientTimeout: 2e3});
        }
        return false;
    }
}


export default new TemplateManager();