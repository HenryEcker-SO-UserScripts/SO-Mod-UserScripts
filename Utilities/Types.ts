export type IdType = number | string;

export interface BaseStacksControllerConfig {
    targets?: string[];
    initialize?: () => void;
    connect?: () => void;
    disconnect?: () => void;
}