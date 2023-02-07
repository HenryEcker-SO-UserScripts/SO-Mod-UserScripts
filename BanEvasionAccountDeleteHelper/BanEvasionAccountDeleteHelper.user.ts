import {annotateUser, deleteUser, getUserPii} from '../Utilities/UserModActions';
import {fetchFullUrlFromUserId, fetchUserIdFromHref,} from '../Utilities/UserInfo';
import {
    attachAttributes,
    buildButton,
    buildCheckboxContainer,
    buildInput,
    buildLabel,
    isCheckboxChecked
} from '../Utilities/StacksComponentBuilders';

interface ValidationBounds {
    min: number;
    max: number;
}

interface UserScriptConfig {
    ids: Record<string, string>;
    validationBounds: Record<string, ValidationBounds>;
}

const config: UserScriptConfig = {
    ids: {
        modal: 'beadh-modal',
        mainAccountIdInput: 'beadh-main-account-id-input',
        deleteReasonDetails: 'beadh-deleteReasonDetails',
        annotationDetails: 'beadh-mod-menu-annotation',
        openMessageUser: 'beadh-message-user-checkbox'
    },
    validationBounds: {
        deleteReasonDetails: {
            min: 15,
            max: 600
        },
        annotationDetails: {
            min: 10,
            max: 300
        },

    }
};

// User Actions
function getUserIdFromAccountInfoURL(): number {
    const userId = fetchUserIdFromHref(window.location.pathname);
    if (userId === undefined) {
        const message = 'Could not get Sock Id from URL';
        StackExchange.helpers.showToast(message, {transientTimeout: 3000, type: 'danger'});
        throw Error(message);
    }
    return userId;
}

function handleDeleteUser(userId: number, deletionDetails: string) {
    return deleteUser(
        userId,
        'This user was created to circumvent system or moderator imposed restrictions and continues to contribute poorly',
        deletionDetails
    )
        .then(res => {
            if (res.status !== 200) {
                const message = `Deletion on ${userId} unsuccessful.`;
                StackExchange.helpers.showToast(message, {transient: false, type: 'danger'});
                console.error(res);
                throw Error(message);
            }
        });
}

function handleAnnotateUser(userId: number, annotationDetails: string) {
    return annotateUser(userId, annotationDetails)
        .then(res => {
            if (res.status !== 200) {
                const message = `Annotation on ${userId} unsuccessful.`;
                StackExchange.helpers.showToast(message, {transient: false, type: 'danger'});
                console.error(res);
                throw Error(message);
            }
        });

}

class DeleteEvasionAccountControls {
    private mainAccountUrl: string;
    private mainAccountId: number;
    private sockUrl: string;
    private sockEmail: string;
    private sockRealName: string;
    private deletionDetails: string;
    private annotationDetails: string;
    private readonly modalBodyContainer: JQuery<HTMLDivElement>;
    private mainAccountLookupControls: JQuery<HTMLDivElement>;
    private mainAccountInfoDisplay: JQuery<HTMLDivElement>;

    constructor(
        private readonly sockAccountId: number,
        private readonly onReady: () => void,
        private readonly onReset: () => void
    ) {
        this.modalBodyContainer = $('<div class="d-flex fd-column g12 mx8"></div>');
        this.createInitial();
    }

    private createInitial() {
        this.mainAccountLookupControls = $('<div class="d-flex fd-row g4 jc-space-between ai-center"></div>');
        this.mainAccountInfoDisplay = $('<div></div>');
        this.modalBodyContainer
            .append(this.mainAccountLookupControls)
            .append(this.mainAccountInfoDisplay);

        this.createMainAccountInput();
    }


    private createMainAccountInput() {
        const input = buildInput({type: 'number', id: config.ids.mainAccountIdInput});

        const checkButton = buildButton('Resolve User URL', {
            className: 's-btn__primary',
            type: 'button',
            style: 'min-width:max-content;'
        });

        checkButton.on('click', (ev) => {
            ev.preventDefault();
            this.mainAccountId = Number(input.val());

            if (this.mainAccountId === this.sockAccountId) {
                StackExchange.helpers.showToast('Cannot enter current account ID in parent field.', {
                    type: 'danger',
                    transientTimeout: 3000
                });
                return;
            }

            // Disable so that no changes are made with this information after the fact (a refresh is required to fix this)
            input.prop('disabled', true);
            checkButton.prop('disabled', true);


            void fetchFullUrlFromUserId(this.mainAccountId)
                .then((mainUrl) => {
                    this.mainAccountUrl = mainUrl;
                    this.createMainAccountInfoDisplay();
                });
        });

        this.mainAccountLookupControls
            .append(buildLabel('Enter Id For Main Account: ', {
                htmlFor: config.ids.mainAccountIdInput,
                style: 'min-width:fit-content;'
            }))
            .append(input)
            .append(checkButton);
    }

    private createMainAccountInfoDisplay() {
        this.mainAccountInfoDisplay
            .append(
                $('<div class="d-flex fd-row g6"></div>')
                    .append(buildLabel('Main account located here:'))
                    .append($(`<a href=${this.mainAccountUrl} target="_blank">${this.mainAccountUrl}</a>`))
            );
        this.createDeleteAndAnnotateControls();
    }

    private static buildDetailStringFromObject(obj: Record<string, string>, keyValueSeparator: string, recordSeparator: string, alignColumns = false) {
        const filteredObj = Object.entries(obj)
            .reduce((acc, [key, value]) => {
                if (value.length > 0) {
                    acc[`${key}${keyValueSeparator}`] = value;
                }
                return acc;
            }, {} as Record<string, string>);

        const getPaddingStr = (function () {
            if (alignColumns) {
                const maxLabelLength = Math.max(...Object.keys(filteredObj).map(k => k.length));
                return function (key: string) {
                    return new Array(maxLabelLength - key.length + 1).join(' ');
                };
            } else {
                return function (_: unknown) {
                    return '';
                };
            }
        }());

        return Object.entries(filteredObj)
            .map(([key, value]) => `${key}${getPaddingStr(key)}${value}`)
            .join(recordSeparator);

    }

    private static buildTextarea(
        labelText: string,
        textareaConfig: {
            id: string;
            rows: number;
            name: string;
            placeholder: string;
        },
        initialText: string,
        changeHandler: (ev: JQuery.ChangeEvent) => void,
        validationBounds: ValidationBounds
    ) {
        const label = buildLabel(labelText, {
            className: 'flex--item',
            htmlFor: textareaConfig.id
        });
        const textarea = attachAttributes(
            $('<textarea style="font-family:monospace" class="flex--item s-textarea" data-se-char-counter-target="field" data-is-valid-length="false"></textarea>'),
            textareaConfig
        );
        textarea.val(initialText);
        textarea.on('change', changeHandler);

        return $(`<div class="d-flex ff-column-nowrap gs4 gsy" data-controller="se-char-counter" data-se-char-counter-min="${validationBounds.min}" data-se-char-counter-max="${validationBounds.max}"></div>`)
            .append(label)
            .append(textarea)
            .append('<div data-se-char-counter-target="output" class="cool"></div>');

    }


    private buildDeleteReasonDetailsTextarea() {
        this.deletionDetails = `\n\n${DeleteEvasionAccountControls.buildDetailStringFromObject({
            'Main Account': this.mainAccountUrl,
            'Email': this.sockEmail,
            'Real name': this.sockRealName
        }, ':  ', '\n', true)}`;
        return DeleteEvasionAccountControls.buildTextarea(
            'Please provide details leading to the deletion of this account (required):',
            {
                id: config.ids.deleteReasonDetails,
                name: 'deleteReasonDetails',
                placeholder: 'Please provide at least a brief explanation of what this user has done; this will be logged with the action and may need to be referenced later.',
                rows: 6
            },
            this.deletionDetails,
            (ev) => {
                this.deletionDetails = $(ev.target).val() as string;
            },
            config.validationBounds.deleteReasonDetails
        );
    }


    private buildAnnotateDetailsTextarea() {
        this.annotationDetails = DeleteEvasionAccountControls.buildDetailStringFromObject({
            'Deleted evasion account': this.sockUrl,
            'Email': this.sockEmail,
            'Real name': this.sockRealName
        }, ': ', ' | ');

        return DeleteEvasionAccountControls.buildTextarea(
            'Annotate the main account (required): ',
            {
                id: config.ids.annotationDetails,
                name: 'annotation',
                placeholder: 'Examples: &quot;possible sock of /users/XXXX, see mod room [link] for discussion&quot; or &quot;left a series of abusive comments, suspend on next occurrence&quot;',
                rows: 4
            },
            this.annotationDetails,
            (ev) => {
                this.annotationDetails = $(ev.target).val() as string;
            },
            config.validationBounds.annotationDetails
        );
    }

    private followUpActionControls() {
        return $('<div class="d-flex fd-row"></div>')
            .append(buildCheckboxContainer('Open message user in new tab', {
                id: config.ids.openMessageUser,
                checked: true
            }));
    }

    private createDeleteAndAnnotateControls() {
        void Promise.all([
            getUserPii(this.sockAccountId),
            fetchFullUrlFromUserId(this.sockAccountId)
        ])
            .then(([{email, name}, sockUrl]) => {
                this.sockEmail = email;
                this.sockRealName = name;
                this.sockUrl = sockUrl;
                this.modalBodyContainer
                    .append(this.buildDeleteReasonDetailsTextarea())
                    .append(this.buildAnnotateDetailsTextarea())
                    .append(this.followUpActionControls());
            })
            .then(() => {
                // Form is now ready to be submitted
                this.onReady();
            });
    }


    getModalBodyContainer() {
        return this.modalBodyContainer;
    }

    resetModalBodyContainer() {
        this.modalBodyContainer.empty();
        this.onReset();
        this.createInitial();
    }


    private static validateLength(label: string, s: string, bounds: ValidationBounds) {
        if (s.length < bounds.min || s.length > bounds.max) {
            const message = `${label} has ${s.length} characters which is outside the supported bounds of ${bounds.min} to ${bounds.max}`;
            StackExchange.helpers.showToast(
                message,
                {
                    transientTimeout: 3000,
                    type: 'danger'
                }
            );
            throw Error(message);
        }
    }

    validateFields() {
        DeleteEvasionAccountControls.validateLength('Deletion reason details', this.deletionDetails, config.validationBounds.deleteReasonDetails);
        DeleteEvasionAccountControls.validateLength('Annotation details', this.annotationDetails, config.validationBounds.annotationDetails);
    }

    getFields() {
        return {
            sockAccountId: this.sockAccountId,
            deletionDetails: this.deletionDetails,
            mainAccountId: this.mainAccountId,
            annotationDetails: this.annotationDetails,
            shouldMessageAfter: isCheckboxChecked(config.ids.openMessageUser)
        };
    }
}


function createModal() {
    const submitButton = buildButton(
        'Delete and Annotate',
        {className: 'flex--item s-btn__filled s-btn__danger', type: 'button', disabled: true}
    );
    const controller = new DeleteEvasionAccountControls(
        getUserIdFromAccountInfoURL(),
        () => {
            // Activate modal submit button
            submitButton.prop('disabled', false);
        },
        () => {
            // De-activate modal submit button
            submitButton.prop('disabled', true);
        }
    );
    submitButton.on('click', (ev) => {
        ev.preventDefault();
        controller.validateFields(); // validate before confirming (it's more annoying to confirm, then get a message that the field needs fixed)
        void StackExchange.helpers.showConfirmModal({
            title: 'Are you sure you want to delete this account?',
            body: 'You will be deleting this account and placing an annotation on the main. This operation cannot be undone.',
            buttonLabelHtml: 'I\'m sure'
        })
            .then(actionConfirmed => {
                if (!actionConfirmed) {
                    return;
                }
                const {
                    sockAccountId,
                    deletionDetails,
                    mainAccountId,
                    annotationDetails,
                    shouldMessageAfter
                } = controller.getFields();

                handleDeleteUser(sockAccountId, deletionDetails)
                    .then(() => {
                        return handleAnnotateUser(mainAccountId, annotationDetails);
                    })
                    .then(() => {
                        if (shouldMessageAfter) {
                            // Open new tab to send message to main account
                            window.open(`/users/message/create/${mainAccountId}`, '_blank');
                        }
                        // Reload current page if delete and annotation is successful
                        window.location.reload();
                    })
                    .catch(err => {
                        console.error(err);
                    });
            });
    });

    const cancelButton = buildButton(
        'Cancel',
        {className: 'flex--item s-btn__muted', type: 'button', 'data-action': 's-modal#hide'}
    );
    cancelButton.on('click', () => {
        controller.resetModalBodyContainer();
    });
    // Build Modal
    return $(`<aside class="s-modal s-modal__danger" id="${config.ids.modal}" tabindex="-1" role="dialog" aria-labelledby="${config.ids.modal}-title" aria-describedby="${config.ids.modal}-description" aria-hidden="false" data-controller="s-modal" data-s-modal-target="modal">`)
        .append(
            $('<div class="s-modal--dialog" role="document">')
                .append(`<h1 class="s-modal--header" id="${config.ids.modal}-title">Delete Ban Evasion Account</h1>`)
                .append(
                    $(`<div class="s-modal--body" id="${config.ids.modal}-description"></div>`)
                        .append(controller.getModalBodyContainer())
                )
                .append(
                    $('<div class="d-flex gx8 s-modal--footer"></div>')
                        .append(submitButton)
                        .append(cancelButton)
                )
                .append(
                    '<button class="s-modal--close s-btn s-btn__muted" type="button" aria-label="Close" data-action="s-modal#hide"><svg aria-hidden="true" class="svg-icon iconClearSm" width="14" height="14" viewBox="0 0 14 14"><path d="M12 3.41 10.59 2 7 5.59 3.41 2 2 3.41 5.59 7 2 10.59 3.41 12 7 8.41 10.59 12 12 10.59 8.41 7 12 3.41Z"></path></svg></button>'
                )
        );
}

function handleBanEvasionButtonClick(ev: JQuery.Event) {
    ev.preventDefault();
    const modal = document.getElementById(config.ids.modal);
    if (modal !== null) {
        Stacks.showModal(modal);
    } else {
        $('body').append(createModal());
    }
}

function main() {
    // Adds link to list of mod actions in Dashboard
    const link = $('<a href="#" role="button">delete ban evasion account</a>');
    link.on('click', handleBanEvasionButtonClick);
    $('.list.list-reset.mod-actions li:eq(3)')
        .after(
            $('<li></li>')
                .append(link)
        );
}

StackExchange.ready(() => {
    main();
});