import {addBanEvasionModalController} from './stimulus-components/stimulus-controller';
import {runVoidOnce} from 'se-ts-userscript-utilities/Utilities/General';

const onceAddBanEvasionModalController = runVoidOnce(addBanEvasionModalController);

/*** Create and connect open modal link ***/
function handleBanEvasionButtonClick(ev: JQuery.Event) {
    ev.preventDefault();
    onceAddBanEvasionModalController();
    const modal = document.getElementById(JS_MODAL_ID);
    if (modal !== null) {
        Stacks.showModal(modal);
    } else {
        // Attach modal to DOM
        $('body').append(INITIAL_MODAL_HTML);
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