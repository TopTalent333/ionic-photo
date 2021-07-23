import { Product } from './Product';
import { Image } from './Image';
import { OrderlineOperation } from '../enums/OrderlineOperation';

export class SelectionModel {
	images: Array<Image> = [];
	product: Product;
	operation: OrderlineOperation;
	index: number;
	quantity: number;
}