
export type OrderStatus = 'pending' | 'shipping' | 'delivered' | 'canceled';

export interface Order {
  id: string;
  productName: string;
  price: number;
  status: OrderStatus;
  isMember: boolean;
  couponCount: number;
  requestMessage?: string;
}

export const orders: Order[] = [
  {
    id: 'A-1001',
    productName: '기계식 키보드',
    price: 129000,
    status: 'pending',
    isMember: true,
    couponCount: 2,
  },
  {
    id: 'A-1002',
    productName: '모니터 받침대',
    price: 39000,
    status: 'shipping',
    isMember: false,
    couponCount: 0,
    requestMessage: '문 앞에 놓아 주세요',
  },
  {
    id: 'A-1003',
    productName: '무선 마우스',
    price: 59000,
    status: 'delivered',
    isMember: true,
    couponCount: 0,
  },
  {
    id: 'A-1004',
    productName: 'USB-C 허브',
    price: 45000,
    status: 'canceled',
    isMember: false,
    couponCount: 1,
  },
];