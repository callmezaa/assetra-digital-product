export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  file_url: string;
  thumbnail_url: string;
  user_id: string;
  tags?: string[];
  has_pro_overlay?: boolean;
  status: 'published' | 'draft';
  created_at: string;
  profiles?: {
    id: string;
    full_name: string;
    avatar_url: string;
    username: string;
  };
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface Order {
  id: string;
  user_id: string;
  product_id: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}
