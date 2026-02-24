export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'employee';
  department?: string;
}

export interface TimeLog {
  id: string;
  userId: string;
  userName: string;
  userInitials: string;
  department: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'validado' | 'sin_salida' | 'en_curso';
  totalHours: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: 'Maquinaria' | 'Herramientas' | 'Consumibles';
  stock: number;
  maxStock: number;
  status: 'en_stock' | 'stock_bajo';
}

export interface Route {
  id: string;
  name: string;
  vehicleId: string;
  driverName: string;
  driverPhoto?: string;
  progress: number;
  status: 'en_progreso' | 'completado' | 'pendiente';
  lastLocation?: string;
}
