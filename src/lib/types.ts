// ==================== Auth ====================
export interface AuthRequest {
  username: string;
  password: string;
}

export interface UserRegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  username: string;
  email: string;
  roles: string[];
}

// ==================== User ====================
export interface UserResponse {
  user_id: number;
  username: string;
  email: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
  roles: string[];
}

export interface UserUpdateRequest {
  username?: string;
  email?: string;
  password?: string;
}

// ==================== Product ====================
export interface CategoryResponse {
  category_id: number;
  name: string;
}

export interface ProductResponse {
  product_id: number;
  name: string;
  price: number;
  description: string;
  stock_quantity: number;
  weight: number;
  created_at: string;
  updated_at: string;
  categories: CategoryResponse[];
  user_id: number;
}

export interface PaginatedProductResponse {
  data: ProductResponse[];
  page_no: number;
  page_size: number;
  total_elements: number;
  total_pages: number;
  last: boolean;
}

// ==================== Cart ====================
export interface CartItemResponse {
  cart_item_id: number;
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
  weight: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  productId: number;
  quantity: number;
}

// ==================== Order ====================
export type OrderStatus = "PENDING" | "CANCELLED" | "PAYMENT_FAILED" | "PAID" | "SHIPPED";

export interface OrderResponse {
  order_id: number;
  user_id: number;
  subtotal: number;
  shipping_fee: number;
  tax_fee: number;
  total_amount: number;
  status: OrderStatus;
  order_date: string;
  xendit_invoice_id: string;
  xendit_payment_status: string;
  xendit_payment_method: string;
  payment_url: string;
}

export interface PaginatedOrderResponse {
  data: OrderResponse[];
  page_no: number;
  page_size: number;
  total_elements: number;
  total_pages: number;
  last: boolean;
}

export interface OrderItemResponse {
  order_item_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  total_price: number;
}

export interface CheckoutRequest {
  cartItemIds: number[];
  userAddressId: number;
}

// ==================== Address ====================
export interface UserAddressResponse {
  user_address_id: number;
  label: string;
  recipient_name: string;
  phone: string;
  street_address: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
}

export interface UserAddressRequest {
  label: string;
  recipientName: string;
  phone: string;
  streetAddress: string;
  city: string;
  province: string;
  postalCode: string;
}

// ==================== Shipping ====================
export interface ShippingRateRequest {
  originCity: string;
  destinationCity: string;
  weight: number;
}

export interface ShippingRateResponse {
  shipping_fee: number;
  estimated_days: string;
}

// ==================== Error ====================
export interface ErrorResponse {
  message: string;
  status: number;
}
