export interface Layer {
  id: number;
  name: string;
  icon: string;
  display_order: number;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  layer_id: number;
  display_order: number;
}

export interface TechItem {
  id: number;
  name: string;
  category_id: number;
  status: 'active' | 'missing';
  priority: 'high' | 'medium' | 'low' | '';
  is_new: number;
  description: string;
  tags: string;
  display_order: number;
}

export interface Stats {
  active: number;
  missing: number;
  total: number;
  coverage: string;
}
