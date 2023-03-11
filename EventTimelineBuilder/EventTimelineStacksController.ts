import {type ActionEvent} from '@hotwired/stimulus';
import {type BaseStacksControllerConfig} from '../Utilities/Types';
import {handlePostTimelineTimestampClick} from './pages/PostTimelinePage';


type EventTimelineStackControllerConfig =
    BaseStacksControllerConfig |
    { [functionName: string]: (ev: ActionEvent) => void; };

export function buildStacksController() {
    const controllerConfig: EventTimelineStackControllerConfig = {
        DATA_ACTION_POST_TIMELINE_TIMESTAMP_CLICK: handlePostTimelineTimestampClick
    };
    Stacks.addController('DATA_CONTROLLER', controllerConfig);
}