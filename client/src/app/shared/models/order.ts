export interface Order {
  id: number;
  userId: string;
  orderDate: Date;
  orderStatus: string;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discount: number;
  couponCode?: string;
  total: number;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  phoneNumber: string;
  shippingMethod: string;
  estimatedDeliveryDays: number;
  paymentIntentId?: string;
  paymentStatus: string;
  paymentDate?: Date;
  items: OrderItem[];
  notes?: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  unitPrice: number;
  quantity: number;
}

export interface CreateOrderRequest {
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  phoneNumber: string;
  shippingMethod: string;
  paymentMethod?: string;
  couponCode?: string;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discount: number;
  total: number;
  items: CreateOrderItemRequest[];
}

export interface CreateOrderItemRequest {
  productId: number;
  productName: string;
  productImageUrl: string;
  unitPrice: number;
  quantity: number;
}

export interface PaymentDetails {
  paymentIntentId: string;
  processorResponse?: string;
}
