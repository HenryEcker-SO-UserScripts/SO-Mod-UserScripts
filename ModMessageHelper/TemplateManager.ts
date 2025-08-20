import type {UserDefinedMessageTemplate} from './ModMessageTypes';

class TemplateManager {
    private readonly templates: UserDefinedMessageTemplate[];

    constructor() {
        this.templates = GM_getValue<UserDefinedMessageTemplate[]>('ModMessageTemplates', []);
    }

    get customMessageTemplates() {
        return this.templates;
    }

    getCustomMessageTemplateByReasonId(reasonId: string): UserDefinedMessageTemplate[] {
        return this.templates.filter(x => {
            return x.TemplateName.localeCompare(reasonId) === 0;
        });
    }
}


export default new TemplateManager();