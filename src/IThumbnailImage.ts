namespace Manifesto {
    export interface IThumbnailImage {
        data: any;
        index: number;
        uri: string;
        label: string;
        visible: boolean;

        height: number;
        width: number;

        actualWidth: number;
        actualHeight: number;

        scale: number;

        toString() : string;
    }
}