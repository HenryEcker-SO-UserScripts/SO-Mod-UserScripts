import {addBanEvasionModalController} from './stimulus-components/stimulus-controller';


/*** Build Base Modal (Only includes the first part of the form) ***/
function createModal() {
    // Build Modal
    return $(INITIAL_MODAL_HTML);
}

function createModalAndAddController() {
    addBanEvasionModalController();
    $('body').append(createModal());
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