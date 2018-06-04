namespace Manifesto {
    export interface ICanvas extends IResource {
        ranges: IRange[];

        //getThumbUri(width: number): string;
        //getType(): CanvasType;
        getThumbnailAtSize(sizeRequestInput?: IThumbnailSizeRequest): ThumbnailImage;
        getCanonicalImageUri(width?: number): string;
        getContent(): IAnnotation[]; // deprecate - use getItems instead
        getDuration(): number | null;
        getHeight(): number;
        getImages(): IAnnotation[];
        getIndex(): number;
        getMaxDimensions(): Size | null;
        getWidth(): number;
    }
}