import { Injectable } from "@angular/core";
import { Http } from '@angular/http';
import "rxjs/Rx";
import { Orientations } from '../enums/Orientations';
import { Image } from '../models/Image';
import { AppSettings } from '../settings/AppSettings';

@Injectable()
export class ImageService {
    private controller: string = 'images/';

    constructor(
        private http: Http
    ) { }

    get = {
        slider: (): Promise<Array<string>> => {
            return this.http.get(AppSettings.apiUrl + this.controller + 'slider/')
                .map(response => response.json())
                .toPromise();
        }
    }

    /**
     * Fetches the orientation of this image
     * @param image The image to fetch the orientation from
     */
    getOrientation(image: Image): Orientations {
        if (image.height > image.width) return Orientations.Portrait
        else if (image.height < image.width) return Orientations.Landscape
        else if (image.height == image.width) return Orientations.Square;
    }
}