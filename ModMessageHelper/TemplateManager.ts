import {arrayMoveMutable} from 'array-move';
import {$boolean, $enum, $number, $object, $opt, $string} from 'lizod';
import {SystemReasonIdList, type UserDefinedMessageTemplate} from './ModMessageTypes';

function $nonEmptyString(input: unknown): input is string {
    return typeof input === 'string' && input.trim().length > 0;
}

const templateValidator = $object({
    TemplateName: $nonEmptyString,
    TemplateBody: $nonEmptyString,
    AnalogousSystemReasonId: $enum(SystemReasonIdList),
    DefaultSuspendDays: $opt($number),
    StackOverflowOnly: $opt($boolean),
    IncludeSuspensionFooter: $opt($boolean),
    SuspensionFooter: $opt($string),
    Header: $opt($string),
    Footer: $opt($string),
});

function validateTemplate(maybeTemplate: unknown, validationErrorMessage: string): maybeTemplate is UserDefinedMessageTemplate {
    const ctx: { errors: ((string | symbol | number)[])[]; } = {errors: []};
    const result = templateValidator(maybeTemplate, ctx);
    if (ctx.errors.length > 0) {
        console.error('Validation Error', ctx);
        StackExchange.helpers.showToast(validationErrorMessage, {
            type: 'danger',
            transient: true,
            transientTimeout: 4e3
        });
        return false;
    }
    return result;
}

function validateTemplateArray(maybeTemplateArray: unknown[], validationErrorMessage: string): maybeTemplateArray is UserDefinedMessageTemplate[] {
    if (maybeTemplateArray.every(t => {
        const ctx: { errors: ((string | symbol | number)[])[]; } = {errors: []};
        const result = templateValidator(t, ctx);
        if (ctx.errors.length > 0) {
            console.error('Validation Error', ctx);
        }
        return result;
    })) {
        return true;
    }
    StackExchange.helpers.showToast(validationErrorMessage, {
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

    save() {
        // Update GM Store
        GM_setValue(this.GM_Store_Key, this.templates);
    }

    get count() {
        return this.templates.length;
    }

    get customMessageTemplates() {
        return this.templates;
    }

    lookupByIndex(index: number): UserDefinedMessageTemplate {
        return this.templates[index];
    }

    lookupByReasonId(reasonId: string): UserDefinedMessageTemplate[] {
        return this.templates.filter(x => {
            return x.TemplateName.localeCompare(reasonId) === 0;
        });
    }

    move(fromIndex: number, toIndex: number) {
        arrayMoveMutable(this.templates, fromIndex, toIndex);
        this.save();
    }

    private async unsafeSaveTemplate(maybeTemplate: unknown, index: number | undefined, shouldSave: boolean): Promise<boolean> {
        if (!validateTemplate(maybeTemplate, 'Unable to parse template. See console for errors.')) {
            return false;
        }
        if (index === undefined) {
            if (this.hasName(maybeTemplate.TemplateName)) {
                StackExchange.helpers.showToast('A template with this name already exists! Template names must be unique.', {
                    type: 'danger',
                    transient: true,
                    transientTimeout: 4e3
                });
                return false;
            }
        } else if (!this.has(index)) {
            StackExchange.helpers.showToast('This template index does not exist so it cannot be updated!', {
                type: 'danger',
                transient: true,
                transientTimeout: 4e3
            });
            return false;
        }

        return this.insertOrUpdate(maybeTemplate, index, false, shouldSave);
    }

    async saveNewTemplate(maybeTemplate: unknown): Promise<boolean> {
        return this.unsafeSaveTemplate(maybeTemplate, undefined, true);
    }

    async saveExistingTemplate(maybeTemplate: unknown, index: number): Promise<boolean> {
        return this.unsafeSaveTemplate(maybeTemplate, index, true);
    }

    private async insertOrUpdate(newTemplate: UserDefinedMessageTemplate, index: number | undefined, shouldPromptDuplicates: boolean, shouldSave: boolean): Promise<boolean> {
        const existingTemplateIndex = index ?? this.templates.findIndex(t => t.TemplateName === newTemplate.TemplateName);
        // If is a new template
        if (existingTemplateIndex === -1) {
            this.templates.push(newTemplate);
        } else {
            if (shouldPromptDuplicates) {
                // Template already exists
                const shouldReplace = await StackExchange.helpers.showConfirmModal({
                    title: 'Duplicate Template Found',
                    bodyHtml: `<div><p>The template "${newTemplate.TemplateName}" already exists.</p><p>Do you want to overwrite the existing template with the import?</p></div>`,
                    buttonLabel: 'Overwrite'
                });

                // Confirm Dialog Failed
                if (!shouldReplace) {
                    return false;
                }
            }

            // Overwrite Template with new Template Values
            this.templates[existingTemplateIndex] = newTemplate;
        }

        if (shouldSave) {
            this.save();
        }
        return true;
    }

    has(index: number): boolean {
        return this.templates?.[index] !== undefined;
    }

    hasName(templateName: string): boolean {
        return this.templates.some(t => t.TemplateName === templateName);
    }

    async delete(index: number): Promise<void> {
        if (!this.has(index)) {
            return;
        }
        const shouldDelete = await StackExchange.helpers.showConfirmModal({
            title: 'Template Deletion',
            bodyHtml: `<div><p>This will delete the following template "${this.templates[index].TemplateName}"</p><p>Are you sure you want to permenantly delete this template?</p></div>`,
            buttonLabel: 'Yes'
        });
        if (!shouldDelete) {
            return;
        }
        this.templates.splice(index, 1);
        this.save();
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
            if (!validateTemplateArray(maybeTemplateArray, 'Unable to parse template import. See console error for more details')) {
                return false;
            }
            // Import by insert or updating
            for (const newTemplate of maybeTemplateArray) {
                void await this.insertOrUpdate(newTemplate, undefined, true, false);
            }

            this.save();
            return true;
        } catch (SyntaxError) {
            StackExchange.helpers.showToast('Invalid JSON!', {type: 'danger', transient: true, transientTimeout: 2e3});
        }
        return false;
    }

    exportToJsonString(indexes: number[]): string {
        const result = this.templates.filter((_, i) => indexes.includes(i));
        return JSON.stringify(result, null, 2);
    }
}


export default new TemplateManager();