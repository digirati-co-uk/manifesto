namespace Manifesto {
    export class Service extends ManifestResource implements IService {

        constructor(jsonld?: any, options?: IManifestoOptions){
            super(jsonld, options);
        }

        getProfile(): ServiceProfile{
            let profile: any = this.getProperty('profile');

            if (!profile) {
                profile = this.getProperty('dcterms:conformsTo');
            }

            if (Array.isArray(profile)){
                return new ServiceProfile(profile[0]);
            }

            return new ServiceProfile(profile);
        }

        
        getConfirmLabel(): string | null {
            return Utils.getLocalisedValue(this.getProperty('confirmLabel'), this.options.locale);
        }

        getDescription(): string | null {
            return Utils.getLocalisedValue(this.getProperty('description'), this.options.locale);
        }

        getFailureDescription(): string | null {
            return Utils.getLocalisedValue(this.getProperty('failureDescription'), this.options.locale);
        }

        getFailureHeader(): string | null {
            return Utils.getLocalisedValue(this.getProperty('failureHeader'), this.options.locale);
        }

        getHeader(): string | null {
            return Utils.getLocalisedValue(this.getProperty('header'), this.options.locale);
        }

        getServiceLabel(): string | null {
            return Utils.getLocalisedValue(this.getProperty('label'), this.options.locale);
        }

        getInfoUri(): string {

            let infoUri: string = this.id;

            if (!infoUri.endsWith('/')) {
                infoUri += '/';
            }

            infoUri += 'info.json';

            return infoUri;
        }
    }
}