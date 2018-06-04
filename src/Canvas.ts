namespace Manifesto {
    export class Canvas extends Resource implements ICanvas{

        public ranges: IRange[];

        constructor(jsonld?: any, options?: IManifestoOptions){
            super(jsonld, options);
        }

        // @todo move to utils.
        private imageServiceToThumbnail(sizeRequestInput: IThumbnailSizeRequest, thumbnailService: any): ThumbnailImage | null {
            const sizeRequest = Object.assign({
                height: this.getHeight(),
                width: this.getWidth(),
                maxHeight: Infinity,
                maxWidth: Infinity,
                minWidth: 1,
                minHeight: 1,
            }, sizeRequestInput);

            const region: string = 'full';
            const rotation: number = 0;
            const quality: string = (thumbnailService['@context'] && (thumbnailService['@context'].indexOf('/1.0/context.json') > -1 ||
                thumbnailService['@context'].indexOf('/1.1/context.json') > -1 ||
                thumbnailService['@context'].indexOf('/1/context.json') > -1 )) ? 'native' : 'default';

            if (thumbnailService.sizes && thumbnailService.sizes.length) {
                // We can find the closest size and return.

                // There is 4 data points that filter data out, and 2 data points that order.
                // The 4 data points that filter are {min,max}{Height,Width}
                const suitableSizes = thumbnailService.sizes.filter(size => (
                    size.height <= sizeRequest.maxHeight &&
                    size.height >= sizeRequest.minHeight &&
                    size.width <= sizeRequest.maxWidth &&
                    size.width >= sizeRequest.minWidth
                ));

                if (suitableSizes.length) {
                    // Distance function, removes negative sign.
                    const abs = n => (n < 0) ? ~n+1 : n;
                    // Compares distance between two properties from the sizeRequest (width/height)
                    const compareDistanceFromSizeRequest = propName => (a, b) => {
                        const diffA = abs(a[propName] - sizeRequest[propName]);
                        const diffB = abs(b[propName] - sizeRequest[propName]);
                        if (diffA < diffB) {
                            return -1;
                        }
                        if (diffA > diffB) {
                            return 1;
                        }
                        return 0;
                    };
                    // At this point we will definitely be returning an image, we just need to choose the right one.
                    // First order both by height and width (closest to request)
                    const heightFirst = suitableSizes.sort(compareDistanceFromSizeRequest('height'))[0];
                    const widthFirst = suitableSizes.sort(compareDistanceFromSizeRequest('width'))[0];

                    // If they agree, just pick one. If not choose the closest (pixel-wise).
                    // Maybe we should just choose the largest one. @todo review.
                    const selectedValue = heightFirst === widthFirst
                        ? (widthFirst)
                        : (
                            abs(widthFirst.width - sizeRequest.width) < abs(heightFirst.height - sizeRequest.height)
                                ? widthFirst
                                : heightFirst
                        );

                    const id = thumbnailService['@id'] && thumbnailService['@id'].endsWith('/')
                        ? thumbnailService['@id'].substr(0, thumbnailService['@id'].length - 1)
                        : thumbnailService['@id'];

                    return new ThumbnailImage(
                        [
                            id,
                            region,
                            [selectedValue.width, selectedValue.height].join(','),
                            rotation,
                            quality + '.jpg' // @todo format against available.
                        ].join('/'),
                        sizeRequest.width,
                        sizeRequest.height,
                        selectedValue.width,
                        selectedValue.height,
                    );
                }
            }

            if (thumbnailService.profile) {
                // If we have a profile...
            }

            if (sizeRequestInput.follow) {
                // If we have follow set to true, we can load the info.json and try to load that.
            }

            return null;
        }

        thumbnailInBounds(sizeInput: IThumbnailSizeRequest, thumbnail) {
            return (thumbnail.width || Infinity) >= (sizeInput.minWidth || 0) &&
                (thumbnail.width || 0) <= (sizeInput.maxWidth || Infinity) &&
                (thumbnail.height || Infinity) >= (sizeInput.minHeight || 0) &&
                (thumbnail.height || 0) <= (sizeInput.maxHeight || Infinity);
        }

        /**
         * Get thumbnail at a specific size.
         *
         * This will check the following places in order for a suitable thumbnail at a preferred size.
         *
         * - Thumbnail service on canvas
         * - Thumbnail service on first image
         * - Image service on first image
         *
         * If we can't find a preferred size, we fallback to the following in order:
         * - Thumbnail property on canvas (string)
         * - Thumbnail property on first image (string)
         * - Thumbnail ID on canvas
         * - Thumbnail ID on first image
         * - First image ID.
         *
         * If you pass in `{ follow: true }` into the configuration, then it will follow the thumbnail services
         * to try and find a best size. This is sometimes required to get exact thumbnail sizes.
         * Note: This option is off by default, to avoid multiple requests per thumbnail.
         */
        getThumbnailAtSize(sizeRequestInput?: IThumbnailSizeRequest): ThumbnailImage {
            const sizeInput: IThumbnailSizeRequest = sizeRequestInput || this.options.defaultThumbnailOptions || {
                width: 100,
                height: 150,
                maxWidth: 150,
                maxHeight: 150,
                minWidth: 0,
                minHeight: 0,
            };

            // First check the thumbnail property of the canvas.
            const thumbnail = this.getProperty('thumbnail');
            if (thumbnail && typeof thumbnail !== 'string') {
                // Check for service
                if (thumbnail.service) {
                    // We should be able to return something from this, even if its just the ID.
                    const thumbnailFromThumbnailService = this.imageServiceToThumbnail(sizeInput, thumbnail.service);
                    if (thumbnailFromThumbnailService) {
                        return thumbnailFromThumbnailService;
                    }
                    // Fall through to check first image.
                }
            }

            // In the case of no thumbnail property, try the first image.
            const firstImage: IResource = this.getImages()[0].getResource();

            // First image thumbnail service.
            const firstImageThumbnail = firstImage.getProperty('thumbnail');
            if (firstImageThumbnail && typeof firstImageThumbnail !== 'string') {
                if (firstImageThumbnail.service) {
                    const thumbnailForFirstImageThumbnailService = this.imageServiceToThumbnail(sizeInput, firstImageThumbnail.service);
                    if (thumbnailForFirstImageThumbnailService) {
                        return thumbnailForFirstImageThumbnailService;
                    }
                }
            }

            // First image service.
            const firstImageServices = firstImage.getProperty('service');
            const firstImageService = Array.isArray(firstImageServices) ? firstImageServices[0] : firstImageServices;
            if (firstImageService) {
                const thumbnailFromFirstImageService = this.imageServiceToThumbnail(sizeInput, firstImageService);
                if (thumbnailFromFirstImageService) {
                    return thumbnailFromFirstImageService;
                }
            }

            // After this point, we could not find a preferred size.
            // 1) if the thumbnail property on the canvas exists as a string, use that.
            if (thumbnail && typeof thumbnail === 'string' && this.thumbnailInBounds(sizeInput, { height: this.getHeight(), width: this.getWidth() })) {
                return new ThumbnailImage(
                    thumbnail,
                    sizeInput.width,
                    sizeInput.height,
                    this.getWidth(),
                    this.getHeight(),
                );
            }

            // 2) if the thumbnail property on the canvas exists, use its ID.
            if (thumbnail && thumbnail['@id'] && this.thumbnailInBounds(sizeInput, thumbnail)) {
                return new ThumbnailImage(
                    thumbnail['@id'],
                    sizeInput.width,
                    sizeInput.height,
                    thumbnail.width || this.getWidth(),
                    thumbnail.height || this.getHeight(),
                );
            }

            // 3) if the thumbnail property on the first image exists as a string, use that.
            if (firstImageThumbnail && typeof firstImageThumbnail === 'string') {
                return new ThumbnailImage(
                    firstImageThumbnail,
                    sizeInput.width,
                    sizeInput.height,
                    this.getWidth(),
                    this.getHeight(),
                );
            }

            // 4) if the thumbnail property on the first image exists, use its ID.
            if (firstImageThumbnail && firstImageThumbnail['@id'] && this.thumbnailInBounds(sizeInput, firstImageThumbnail)) {
                return new ThumbnailImage(
                    firstImageThumbnail['@id'],
                    sizeInput.width,
                    sizeInput.height,
                    firstImageThumbnail.width || this.getWidth(),
                    firstImageThumbnail.height || this.getHeight(),
                );
            }

            // 5) We found nothing, use the ID of the first image.
            // @todo could fallback further to out of bounds images?
            return new ThumbnailImage(
                firstImage.getProperty('@id'),
                sizeInput.width,
                sizeInput.height,
                firstImage.getWidth() || this.getWidth(),
                firstImage.getHeight() || this.getHeight(),
            );
        }

        // http://iiif.io/api/image/2.1/#canonical-uri-syntax
        getCanonicalImageUri(w?: number): string {

            let id: string | null = null;
            const region: string = 'full';
            const rotation: number = 0;
            let quality: string = 'default';
            let width: number | undefined = w;
            let size: string;

            // if an info.json has been loaded
            if (this.externalResource && this.externalResource.data && this.externalResource.data['@id']) {
                id = this.externalResource.data['@id'];

                if (!width) {
                    width = (<IExternalImageResourceData>this.externalResource.data).width;
                }

                if (this.externalResource.data['@context']) {
                    if (this.externalResource.data['@context'].indexOf('/1.0/context.json') > -1 ||
                        this.externalResource.data['@context'].indexOf('/1.1/context.json') > -1 ||
                        this.externalResource.data['@context'].indexOf('/1/context.json') > -1 ) {
                        quality = 'native';
                    }
                }

            } else {
                // info.json hasn't been loaded yet
                const images: IAnnotation[] = this.getImages();

                if (images && images.length) {
                    const firstImage: IAnnotation = images[0];
                    const resource: IResource = firstImage.getResource();
                    const services: IService[] = resource.getServices();

                    if (!width) {
                        width = resource.getWidth();
                    }

                    if (services.length) {
                        const service: IService = services[0];
                        id = service.id;
                        quality = Utils.getImageQuality(service.getProfile());
                    } else if (width === resource.getWidth()) {
                        // if the passed width is the same as the resource width
                        // i.e. not looking for a thumbnail
                        // return the full size image.
                        // used for download options when loading static images.
                        return resource.id;
                    }
                }

                // todo: should this be moved to getThumbUri?
                if (!id) {

                    const thumbnail: any = this.getProperty('thumbnail');

                    if (thumbnail) {
                        if (typeof(thumbnail) === 'string') {
                            return thumbnail;
                        } else {
                            if (thumbnail['@id']) {
                                return thumbnail['@id'];
                            } else if (thumbnail.length) { 
                                return thumbnail[0].id;
                            }
                        }
                    }

                }
            }

            size = width + ',';

            // trim off trailing '/'
            if (id && id.endsWith('/')) {
                id = id.substr(0, id.length - 1);
            }

            const uri: string = [id, region, size, rotation, quality + '.jpg'].join('/');

            return uri;
        }

        getMaxDimensions(): Size | null {

            let maxDimensions: Size | null = null;
            let profile: any;

            if (this.externalResource.data && this.externalResource.data.profile) {
                profile = this.externalResource.data.profile;

                if (Array.isArray(profile)) {
                    profile = profile.en().where(p => p["maxWidth" || "maxwidth"]).first();

                    if (profile) {
                        maxDimensions = new Size(profile.maxWidth, profile.maxHeight ? profile.maxHeight : profile.maxWidth);
                    }
                }
            }

            return maxDimensions;
        }

        // Presentation API 3.0
        getContent(): IAnnotation[] {

            const content: IAnnotation[] = [];

            const items = this.__jsonld.items || this.__jsonld.content;

            if (!items) return content;

            // should be contained in an AnnotationPage
            let annotationPage: AnnotationPage | null = null;

            if (items.length) {
                annotationPage = new AnnotationPage(items[0], this.options);
            }

            if (!annotationPage) {
                return content;
            }

            const annotations: IAnnotation[] = annotationPage.getItems();

            for (let i = 0; i < annotations.length; i++) {
                const a = annotations[i];
                const annotation = new Annotation(a, this.options);
                content.push(annotation);
            }

            return content;
        }

        getDuration(): number | null {
            return this.getProperty('duration');
        }

        getImages(): IAnnotation[] {

            const images: IAnnotation[] = [];

            if (!this.__jsonld.images) return images;

            for (let i = 0; i < this.__jsonld.images.length; i++) {
                const a = this.__jsonld.images[i];
                const annotation = new Annotation(a, this.options);
                images.push(annotation);
            }

            return images;
        }

        getIndex(): number {
            return this.getProperty('index');
        }

        getOtherContent(): Promise<AnnotationList[]> {
            const otherContent = Array.isArray(this.getProperty('otherContent')) ?
                this.getProperty('otherContent') :
                [this.getProperty('otherContent')];

            const canonicalComparison = (typeA, typeB): boolean => {
                if (typeof typeA !== 'string' || typeof typeB !== 'string') {
                    return false;
                }
                return typeA.toLowerCase() === typeA.toLowerCase();
            };

            const otherPromises: Promise<AnnotationList>[] = otherContent
                .filter(otherContent => otherContent && canonicalComparison(otherContent['@type'], 'sc:AnnotationList'))
                .map((annotationList, i) => (
                    (new AnnotationList(annotationList['label'] || `Annotation list ${i}`, annotationList, this.options))
                ))
                .map(annotationList => annotationList.load());

            return Promise.all(otherPromises);
        }

        // Prefer thumbnail service to image service if supplied and if
        // the thumbnail service can provide a satisfactory size +/- x pixels.
        // this is used to get thumb URIs *before* the info.json has been requested
        // and populate thumbnails in a viewer.
        // the publisher may also provide pre-computed fixed-size thumbs for better performance.
        //getThumbUri(width: number): string {
        //
        //    var uri;
        //    var images: IAnnotation[] = this.getImages();
        //
        //    if (images && images.length) {
        //        var firstImage = images[0];
        //        var resource: IResource = firstImage.getResource();
        //        var services: IService[] = resource.getServices();
        //
        //        for (let i = 0; i < services.length; i++) {
        //            var service: IService = services[i];
        //            var id = service.id;
        //
        //            if (!_endsWith(id, '/')) {
        //                id += '/';
        //            }
        //
        //            uri = id + 'full/' + width + ',/0/' + Utils.getImageQuality(service.getProfile()) + '.jpg';
        //        }
        //    }
        //
        //    return uri;
        //}

        //getType(): CanvasType {
        //    return new CanvasType(this.getProperty('@type').toLowerCase());
        //}

        getWidth(): number {
            return this.getProperty('width');
        }

        getHeight(): number {
            return this.getProperty('height');
        }
    }
}
