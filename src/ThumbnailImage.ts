namespace Manifesto {
    export class ThumbnailImage implements IThumbnailImage {

        url: string;

        height: number;
        width: number;

        actualWidth: number;
        actualHeight: number;

        scale: number;

        constructor(
            url: string,
            targetWidth: number,
            targetHeight: number,
            actualWidth?: number,
            actualHeight?: number,
        ) {
            this.url = url;
            this.actualHeight = actualHeight || targetHeight;
            this.actualWidth = actualWidth || targetWidth;
            // One trump card for height/width, IIIF specification.
            const matches = url.match(/full\/([0-9]+),([0-9]+)?\/\d\/\w+/);
            if (matches) {
                const newWidth = (+matches[1]) || this.actualWidth;
                this.actualHeight = (+matches[2]) || Math.round((this.actualHeight / this.actualWidth) * newWidth);
                this.actualWidth = newWidth;
            }
            if ((actualHeight && actualWidth) || this.actualWidth !== targetWidth || this.actualHeight !== targetHeight) {
                /**
                 *   |------|       |----------|
                 *   |      |       |          |
                 *   |------|       |----------|
                 *  100 / 100   >    150 / 100
                 *  =   1       >       1.5
                 *  =   false
                 *
                 *  target: 150x100 scaled down to: 100x66.67 to fit in 100x100
                 *  |––––––––––|
                 *  |----------|
                 *  |          |
                 *  |----------|
                 *  |——————————|
                 *
                 *   |------|       |--------|
                 *   |      |       |        |
                 *   |------|       |        |
                 *                  |--------|
                 *  100 / 100   >    100 / 150
                 *  =   1       >       0.6667
                 *  =   true
                 *
                 *  target: 100x150 scaled down to: 66.67x100 to fit in 100x100
                 *  |—|–––––––|—|
                 *  | |       | |
                 *  | |       | |
                 *  |—|———————|—|
                 */

                const cropHeight = (targetWidth / targetHeight) < (this.actualWidth / this.actualHeight);
                this.width = Math.round(cropHeight ? targetWidth : targetHeight*(this.actualWidth / this.actualHeight));
                this.height = Math.round(cropHeight ? targetWidth*(this.actualHeight / this.actualWidth) : targetHeight);
                this.scale = +(cropHeight ? this.actualWidth / targetWidth : this.actualHeight / targetHeight).toFixed(2);
            } else {
                this.height = targetHeight;
                this.width = targetWidth;
                this.scale = 1;
            }
        }

        toString() : string {
            return this.url;
        };
    }
}