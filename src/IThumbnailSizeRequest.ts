namespace Manifesto {
    export interface IThumbnailSizeRequest {
        height: number;
        width: number;

        maxWidth?: number;
        maxHeight?: number;

        minHeight?: number;
        minWidth?: number;

        follow?: boolean;
    }
}