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
            actualHeight?: number
        ) {
            this.url = url;
            this.actualHeight = actualHeight || targetHeight;
            this.actualWidth = actualWidth || targetWidth;
            if (actualHeight && actualWidth) {
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

                var cropHeight = (targetWidth / targetHeight) < (actualWidth / actualHeight);
                this.width = Math.round(cropHeight ? targetWidth : targetHeight*(actualWidth / actualHeight));
                this.height = Math.round(cropHeight ? targetWidth*(actualHeight / actualWidth) : targetHeight);
                this.scale = +(cropHeight ? actualWidth / targetWidth : actualHeight / targetHeight).toFixed(2);
            } else {
                this.height = targetHeight;
                this.width = targetWidth;
                this.scale = this.actualWidth / targetWidth;
            }
        }

        toString() : string {
            return this.url;
        };
    }
}