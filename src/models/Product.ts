import { ProductTypes } from '../enums/ProductTypes';
import { ProductVariation } from '../models/ProductVariation';

export class Product {
    public id: number;
    public type: ProductTypes;
    public name: string;
    public title: string;
    public description: string;
    public variation: ProductVariation;
    public image: string;
}