namespace Manifesto {
    export class ThumbnailSizeRequest implements IThumbnailSizeRequest {

        width: number;
        height: number;

        maxWidth: number;
        maxHeight: number;

        minHeight: number;
        minWidth: number;

        follow: boolean;

        constructor(obj: IThumbnailSizeRequest) {
            this.width = obj.width;
            this.height = obj.height;
            this.maxWidth = obj.maxWidth || Infinity;
            this.maxHeight = obj.maxHeight || Infinity;
            this.minHeight = obj.minHeight || 1;
            this.minWidth = obj.minWidth || 1;
            this.follow = !!obj.follow;
        }
    }
}