namespace Manifesto {
    export interface IThumbnailImage {
        url: string;

        height: number;
        width: number;

        actualWidth: number;
        actualHeight: number;

        scale: number;

        toString() : string;
    }
}