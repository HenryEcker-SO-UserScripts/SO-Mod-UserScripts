import {arrayMoveMutable} from 'array-move';
import {$boolean, $number, $object, $opt, $string} from 'lizod';
import {SystemReasonIdSet} from './ModMessageConstants';
import {type UserDefinedMessageTemplate} from './ModMessageTypes';
import {showStandardConfirmModal, showStandardDangerToast} from './StandardToastAndModalHelpers';


function $nonEmptyString(input: unknown): input is string {
    return $string(input) && input.trim().length > 0;
}

function $setMember(sourceSet: Set<string>) {
    function isMember(input: unknown): input is string {
        return $string(input) && sourceSet.has(input);
    }

    return isMember;
}

const templateValidator = $object({
    TemplateName: $nonEmptyString,
    TemplateBody: $nonEmptyString,
    AnalogousSystemReasonId: $setMember(SystemReasonIdSet),
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
        showStandardDangerToast(validationErrorMessage);
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
    showStandardDangerToast(validationErrorMessage);
    return false;
}

class TemplateManager {
    private readonly templates: UserDefinedMessageTemplate[];
    private readonly GM_Store_Key = 'ModMessageTemplates';
    private _hasPendingChanges: boolean;

    constructor() {
        this.templates = GM_getValue<UserDefinedMessageTemplate[]>(this.GM_Store_Key, []);
        this._hasPendingChanges = false;
    }

    isSystemTemplate(reasonId: string): boolean {
        return SystemReasonIdSet.has(reasonId);
    }

    save() {
        // Update GM Store
        GM_setValue(this.GM_Store_Key, this.templates);
        // We don't know if anything actually has changed, but still flag that *something* was saved
        this._hasPendingChanges = true;
    }

    get count() {
        return this.templates.length;
    }

    get customMessageTemplates() {
        return this.templates;
    }

    hasPendingChanges() {
        return this._hasPendingChanges;
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
        if (this.isSystemTemplate(templateName)) {
            showStandardDangerToast('Template names cannot match any existing system reason ids');
            return false;
        }
        return true;
    }

    private async insertNewTemplate(newTemplate: UserDefinedMessageTemplate, shouldSave: boolean): Promise<boolean> {
        if (this.hasName(newTemplate.TemplateName)) {
            showStandardDangerToast('A template with this name already exists! Template names must be unique.');
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
            showStandardDangerToast('This template index does not exist so it cannot be updated!');
            return false;
        }
        if (!this.testAgainstExistingSystemReasonIds(existingTemplate.TemplateName)) {
            return false;
        }
        if (shouldPromptDuplicates) {
            // Template already exists
            const shouldReplace = await showStandardConfirmModal({
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
            showStandardDangerToast('A different template with this name already exists! Template names must be unique.');
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
        const shouldDelete = await showStandardConfirmModal({
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
            showStandardDangerToast('Invalid JSON!', 2e3);
        }
        return false;
    }

    exportToJsonString(indexes: number[]): string {
        const result = this.templates.filter((_, i) => indexes.includes(i));
        return JSON.stringify(result, null, 2);
    }
}


export default new TemplateManager();