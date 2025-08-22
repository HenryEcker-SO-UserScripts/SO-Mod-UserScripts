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

export default new ModMessageForm();