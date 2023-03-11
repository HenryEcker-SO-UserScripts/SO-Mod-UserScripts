import {type ActionEvent} from '@hotwired/stimulus';
import {fetchFullUrlFromUserId, fetchUserIdFromHref} from '../Utilities/UserInfo';
import {annotateUser, type DeleteReason, deleteUser, getUserPii} from '../Utilities/UserModActions';
import {type BaseStacksControllerConfig} from '../Utilities/Types';
import {config, type ValidationBounds} from './util-beadh/Globals';
import {buildDetailStringFromObject} from '../Utilities/General';


/*** User Actions ***/
function getUserIdFromAccountInfoURL(): number {
    const userId = fetchUserIdFromHref(window.location.pathname);
    if (userId === undefined) {
        const message = 'Could not get Sock Id from URL';
        StackExchange.helpers.showToast(message, {transientTimeout: 3000, type: 'danger'});
        throw Error(message);
    }
    return userId;
}

function handleDeleteUser(userId: number, deletionReason: DeleteReason, deletionDetails: string) {
    return deleteUser(userId, deletionReason, deletionDetails)
        .then(res => {
            if (res.status !== 200) {
                const message = `Deletion of ${userId} unsuccessful.`;
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

function handleDeleteAndAnnotateUsers(
    sockAccountId: number,
    deletionReason: DeleteReason,
    deletionDetails: string,
    mainAccountId: number,
    annotationDetails: string
) {
    return handleDeleteUser(sockAccountId, deletionReason, deletionDetails)
        .then(() => handleAnnotateUser(mainAccountId, annotationDetails));
}

/*** Build Base Modal (Only includes the first part of the form) ***/

function createModal() {
    // Build Modal
    return $(INITIAL_MODAL_HTML);
}

/*** Helper Functions for Stacks Controller ***/
function validateLength(label: string, s: string, bounds: ValidationBounds) {
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


/*** Stacks Controller Configuration ***/


interface BanEvasionControllerKnownTypes extends BaseStacksControllerConfig {
    // Attributes/Variables
    sockAccountId: number;
    mainAccountId: number;
    deletionReason: DeleteReason;
    deletionDetails: string;
    annotationDetails: string;
    shouldMessageAfter: boolean;
    // Helper Functions
    validateFields: () => void;
    buildRemainingFormElements: () => Promise<void>;
}

interface BanEvasionControllerActionEventHandlers {
    [actionEventHandler: string]: (ev: ActionEvent) => void;
}

interface BanEvasionControllerHTMLTargets {
    [htmlTargetKey: string]: HTMLElement;
}

type BanEvasionController =
    BanEvasionControllerKnownTypes
    | BanEvasionControllerActionEventHandlers
    | BanEvasionControllerHTMLTargets;

function createModalAndAddController() {
    const banEvasionControllerConfiguration: BanEvasionController = {
        targets: CONTROLLER_TARGETS,
        initialize() {
            this.sockAccountId = getUserIdFromAccountInfoURL();
        },
        // Needs to be defined for typing reasons
        sockAccountId: undefined,
        get mainAccountId() {
            return Number(this[MAIN_ACCOUNT_ID_INPUT_TARGET].value);
        },
        get deletionReason() {
            return this[DELETION_REASON_SELECT_TARGET].value;
        },
        get deletionDetails() {
            return this[DELETION_DETAILS_TARGET].value;
        },
        get annotationDetails() {
            return this[ANNOTATION_DETAILS_TARGET].value;
        },
        get shouldMessageAfter() {
            return (<HTMLInputElement>this[SHOULD_MESSAGE_AFTER_TARGET]).checked;
        },
        validateFields() {
            validateLength('Deletion reason details', this.deletionDetails, config.validationBounds.deleteReasonDetails);
            validateLength('Annotation details', this.annotationDetails, config.validationBounds.annotationDetails);
        },
        HANDLE_SUBMIT_ACTION(ev: ActionEvent) {
            ev.preventDefault();
            this.validateFields(); // validate before confirming (it's more annoying to confirm, then get a message that the field needs fixed)
            void StackExchange.helpers.showConfirmModal({
                title: 'Are you sure you want to delete this account?',
                body: 'You will be deleting this account and placing an annotation on the main. This operation cannot be undone.',
                buttonLabelHtml: 'I\'m sure'
            })
                .then(actionConfirmed => {
                    if (!actionConfirmed) {
                        return;
                    }

                    handleDeleteAndAnnotateUsers(this.sockAccountId, this.deletionReason, this.deletionDetails, this.mainAccountId, this.annotationDetails)
                        .then(() => {
                            if (this.shouldMessageAfter) {
                                // Open new tab to send message to main account
                                window.open(`/users/message/create/${this.mainAccountId}`, '_blank');
                            }
                            // Reload current page if delete and annotation is successful
                            window.location.reload();
                        })
                        .catch(err => {
                            console.error(err);
                        });
                });
        },
        HANDLE_CANCEL_ACTION(ev: ActionEvent) {
            ev.preventDefault();
            // Clear from DOM which will force click to rebuild and recreate controller
            document.getElementById(JS_MODAL_ID).remove();
        },
        HANDLE_LOOKUP_MAIN_ACCOUNT(ev: ActionEvent) {
            ev.preventDefault();
            if (this.mainAccountId === this.sockAccountId) {
                StackExchange.helpers.showToast('Cannot enter current account ID in parent field.', {
                    type: 'danger',
                    transientTimeout: 3000
                });
                return;
            }

            // Disable so that no changes are made with this information after the fact (a refresh is required to fix this)
            this[MAIN_ACCOUNT_ID_INPUT_TARGET].disabled = true;
            this[MAIN_ACCOUNT_ID_INPUT_BUTTON_TARGET].disabled = true;

            void this.buildRemainingFormElements();
        },
        async buildRemainingFormElements() {
            const [mainUrl, sockUrl, {email: sockEmail, name: sockRealName}] = await Promise.all([
                fetchFullUrlFromUserId(this.mainAccountId),
                fetchFullUrlFromUserId(this.sockAccountId),
                getUserPii(this.sockAccountId)
            ]);

            $(this[FORM_ELEMENTS_TARGET])
                .append(`<div class="d-flex fd-row g6">
                            <label class="s-label">Main account located here:</label>
                            <a href="${mainUrl}" target="_blank">${mainUrl}</a>
                        </div>`)
                .append(MODAL_FORM_HTML);


            const deleteDetailTextArea: HTMLTextAreaElement = this[DELETION_DETAILS_TARGET];
            // Prime delete detail text
            deleteDetailTextArea.value = buildDetailStringFromObject({
                'Main Account': mainUrl + '\n',
                'Email': sockEmail,
                'Real name': sockRealName,
            }, ':  ', '\n', true) + '\n\n';

            // Focus cursor at end of textarea
            deleteDetailTextArea.focus();
            deleteDetailTextArea.setSelectionRange(deleteDetailTextArea.value.length, deleteDetailTextArea.value.length);

            // Prime annotation detail text
            this[ANNOTATION_DETAILS_TARGET].value = buildDetailStringFromObject({
                'Deleted evasion account': sockUrl,
                'Email': sockEmail,
                'Real name': sockRealName
            }, ': ', ' | ');
            // Enable form submit button now that the fields are active
            this[CONTROLLER_SUBMIT_BUTTON_TARGET].disabled = false;
        },
    };
    $('body').append(createModal());
    Stacks.addController(DATA_CONTROLLER, banEvasionControllerConfiguration);
}


/*** Create and connect open modal link ***/
function handleBanEvasionButtonClick(ev: JQuery.Event) {
    ev.preventDefault();
    const modal = document.getElementById(JS_MODAL_ID);
    if (modal !== null) {
        Stacks.showModal(modal);
    } else {
        createModalAndAddController();
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

StackExchange.ready(main);