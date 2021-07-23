import { ProductTypes } from '../enums/ProductTypes';
import { Orientations } from '../enums/Orientations';

export class ProductVariation {
    public id: number;
    public types: Array<ProductTypes> = [];
    public title: string;
    public maxImages: number = 0;
    public minImages: number = 0;
    public height: number;
    public width: number;
    public code: string;
    public price: number;
    public image: string;
    public component: string;
    public orientation: Orientations;
    public orientationImage: string;
}