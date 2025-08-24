import {arrayMoveMutable} from 'array-move';
import {$boolean, $enum, $number, $object, $opt, $string} from 'lizod';
import {type UserDefinedMessageTemplate} from './ModMessageTypes';
import ui from './ModMessageForm';

function $nonEmptyString(input: unknown): input is string {
    return typeof input === 'string' && input.trim().length > 0;
}

const templateValidator = $object({
    TemplateName: $nonEmptyString,
    TemplateBody: $nonEmptyString,
    AnalogousSystemReasonId: $enum(ui.SystemReasonIdList),
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
    hasPendingChanges: boolean;

    constructor() {
        this.templates = GM_getValue<UserDefinedMessageTemplate[]>(this.GM_Store_Key, []);
        this.hasPendingChanges = false;
    }

    save() {
        // Update GM Store
        GM_setValue(this.GM_Store_Key, this.templates);
        this.hasPendingChanges = true;
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

    private getIndexFromName(name: string) {
        return this.templates.findIndex(t => t.TemplateName === name);
    }

    move(fromIndex: number, toIndex: number) {
        arrayMoveMutable(this.templates, fromIndex, toIndex);
        this.save();
    }

    private testAgainstExistingSystemReasonIds(templateName: string) {
        if (ui.isSystemTemplate(templateName)) {
            StackExchange.helpers.showToast('Template names cannot match any existing system reason ids', {
                type: 'danger',
                transient: true,
                transientTimeout: 4e3
            });
            return false;
        }
        return true;
    }

    private async insertNewTemplate(newTemplate: UserDefinedMessageTemplate, shouldSave: boolean): Promise<boolean> {
        if (this.hasName(newTemplate.TemplateName)) {
            StackExchange.helpers.showToast('A template with this name already exists! Template names must be unique.', {
                type: 'danger',
                transient: true,
                transientTimeout: 4e3
            });
            return false;
        }
        if (!this.testAgainstExistingSystemReasonIds(newTemplate.TemplateName)) {
            return false;
        }

        this.templates.push(newTemplate);

        if (shouldSave) {
            this.save();
        }
        return true;
    }

    private async updateExistingTemplate(existingTemplate: UserDefinedMessageTemplate, index: number, shouldPromptDuplicates: boolean, shouldSave: boolean): Promise<boolean> {
        if (!this.has(index)) {
            StackExchange.helpers.showToast('This template index does not exist so it cannot be updated!', {
                type: 'danger',
                transient: true,
                transientTimeout: 4e3
            });
            return false;
        }
        if (!this.testAgainstExistingSystemReasonIds(existingTemplate.TemplateName)) {
            return false;
        }
        if (shouldPromptDuplicates) {
            // Template already exists
            const shouldReplace = await StackExchange.helpers.showConfirmModal({
                title: 'Duplicate Template Found',
                bodyHtml: `<div><p>The template "${existingTemplate.TemplateName}" already exists.</p><p>Do you want to overwrite the existing template with the import?</p></div>`,
                buttonLabel: 'Overwrite'
            });

            // Confirm Dialog Failed
            if (!shouldReplace) {
                return false;
            }
        }

        const foundIndex = this.getIndexFromName(existingTemplate.TemplateName);
        if (foundIndex !== -1 && index !== foundIndex) {
            StackExchange.helpers.showToast('A different template with this name already exists! Template names must be unique.', {
                type: 'danger',
                transient: true,
                transientTimeout: 4e3
            });
            return false;
        }

        // Overwrite Template with new Template Values
        this.templates[index] = existingTemplate;

        if (shouldSave) {
            this.save();
        }
        return true;
    }

    private async insertOrUpdate(newTemplate: UserDefinedMessageTemplate, index: number | undefined, shouldPromptDuplicates: boolean, shouldSave: boolean): Promise<boolean> {
        const existingTemplateIndex = index ?? this.getIndexFromName(newTemplate.TemplateName);
        if (existingTemplateIndex === -1) {
            return this.insertNewTemplate(newTemplate, shouldSave);
        } else {
            return this.updateExistingTemplate(newTemplate, existingTemplateIndex, shouldPromptDuplicates, shouldSave);
        }
    }

    private async unsafeInsertOrUpdate(maybeTemplate: unknown, index: number | undefined, shouldPromptDuplicates: boolean, shouldSave: boolean): Promise<boolean> {
        if (!validateTemplate(maybeTemplate, 'Unable to parse template. See console for errors.')) {
            return false;
        }
        return this.insertOrUpdate(maybeTemplate, index, shouldPromptDuplicates, shouldSave);
    }

    async saveNewTemplate(maybeTemplate: unknown): Promise<boolean> {
        return this.unsafeInsertOrUpdate(maybeTemplate, undefined, false, true);
    }

    async saveExistingTemplate(maybeTemplate: unknown, index: number): Promise<boolean> {
        return this.unsafeInsertOrUpdate(maybeTemplate, index, false, true);
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