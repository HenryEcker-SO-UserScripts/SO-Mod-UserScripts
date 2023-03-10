import {type ActionEvent} from '@hotwired/stimulus';
import {type BaseStacksControllerConfig} from '../Utilities/Types';


type EventTimelineStackControllerConfig =
    BaseStacksControllerConfig |
    { [functionName: string]: (ev: ActionEvent) => void; };

export function buildStacksController() {
    const controllerConfig: EventTimelineStackControllerConfig = {
        DATA_ACTION_HANDLE_TIMESTAMP_CLICK(ev: ActionEvent) {
            console.log(ev.params);
        }
    };
    Stacks.addController('DATA_CONTROLLER', controllerConfig);
}