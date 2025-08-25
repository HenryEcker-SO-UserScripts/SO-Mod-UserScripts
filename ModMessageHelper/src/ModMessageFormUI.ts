const ui = {
    // This can't be moved to Constants without creating a circular dependency
    BlankTemplateOptionValue: '0',
    get $pageTitle(): JQuery {
        return $('.s-page-title');
    },
    get $form(): JQuery<HTMLFormElement> {
        return $('#js-msg-form');
    },
    get $messageContents(): JQuery<HTMLDivElement> {
        return $('#js-message-contents');
    },
    get $aboutUserId(): JQuery<HTMLInputElement> {
        return $('.js-about-user-id[name="userId"]');
    },
    get aboutUserId(): number {
        return Number(this.$aboutUserId.val());
    },
    get $templateSelector(): JQuery<HTMLSelectElement> {
        return $('#select-template-menu');
    },
    get $systemReasonOptions(): JQuery {
        // Get all system options excluding value blankTemplateOptionValue which is "Please select a template..."
        // Also exclude any custom reasons (noted by the attribute data-is-custom="true")
        return this.$templateSelector.find(`option[value!="${this.BlankTemplateOptionValue}"]:not([data-is-custom="true"])`);
    },
    get reasonId(): string {
        return <string>this.$templateSelector.val();
    },
    set reasonId(newOptionValue: string) {
        this.$templateSelector.val(newOptionValue);
    },
    get $suspendReasonInput(): JQuery<HTMLInputElement> {
        return $('#usr-js-suspend-reason');
    },
    get suspendReason(): string {
        return <string>this.$suspendReasonInput.val();
    },
    set suspendReason(newSuspendReason: string) {
        this.$suspendReasonInput.val(newSuspendReason);
    },
    get displayedSelectedTemplate(): string {
        return this.$templateSelector.find('option:selected').text();
    },
    get $customTemplateNameInput(): JQuery<HTMLInputElement> {
        // This html id is defined in attachTemplateNameInputField
        return $('#usr-template-name-input');
    },
    get customTemplateName(): string {
        return <string>this.$customTemplateNameInput.val();
    },
    set customTemplateName(newTemplateName: string) {
        this.$customTemplateNameInput.val(newTemplateName);
    },
    get $suspensionOptions(): JQuery<HTMLFieldSetElement> {
        return $('#suspension-options');
    },
    get $suspensionDays(): JQuery<HTMLInputElement> {
        return $('.js-suspension-days[name="suspendDays"]');
    },
    get suspendDays(): number {
        return Number(this.$suspensionDays.val());
    },
    get $editor(): JQuery<HTMLTextAreaElement> {
        return $('#wmd-input');
    },
    get editorText(): string {
        return <string>this.$editor.val();
    },
    set editorText(newText: string) {
        this.$editor.val(newText);
    },
    refreshEditor() {
        // Refresh previews
        // @ts-expect-error MarkdownEditor is not in StackExchange Type
        StackExchange.MarkdownEditor.refreshAllPreviews();
    },
    get $autoSuspendMessageField(): JQuery<HTMLInputElement> {
        return $('#js-auto-suspend-message');
    },
    get autoSuspendMessageTemplateText(): string {
        return <string>this.$autoSuspendMessageField.val();
    },
    set autoSuspendMessageTemplateText(newValue: string) {
        this.$autoSuspendMessageField.val(newValue);
    },
    hasTemplateSelected(): boolean {
        return this.reasonId !== this.BlankTemplateOptionValue;
    },
    hasCustomTemplateName(): boolean {
        return this.displayedSelectedTemplate !== this.customTemplateName;
    }
};

export const SystemReasonIdSet = new Set(ui.$systemReasonOptions.map((_, n) => $(n).val()).toArray() as string[]);

export default ui;