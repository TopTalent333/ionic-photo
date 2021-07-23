import { Image } from './Image';
import { Product } from './Product';

export class Orderline {
    public attributes: Array<any>;
    public product: Product;
    public image: Image;
    public quantity: number = 1;
    public mosaicImages: Array<Image> = [];
}