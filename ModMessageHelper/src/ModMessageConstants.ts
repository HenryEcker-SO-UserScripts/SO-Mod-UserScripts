import ui from './ModMessageForm';

export const parentUrl = StackExchange?.options?.site?.parentUrl ?? location.origin;
export const parentName = StackExchange.options?.site?.name;

export const modalId = 'usr-mmt-editor-modal';

export const SystemReasonIdList = ui.$systemReasonOptions.map((_, n) => $(n).val()).toArray() as string[];
export const SystemReasonIdSet = new Set(SystemReasonIdList);