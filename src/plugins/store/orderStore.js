import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useOrderStore =  defineStore('order',()=>{
     // ========== DATA DUMMY ==========
const orders = ref([
  // ========== STATUS: ORDER (MENUNGGU DIPROSES) ==========
  { 
    id: 1, 
    meja: 'Meja 7',
    status: 'order',
    items: [
      { 
        name: 'Nasi Goreng', 
        qty: 2, 
        catatan: 'Pedas', 
        price: 25000,
        image: 'https://images.unsplash.com/photo-1644592655775-973c748e2c8f?w=100&h=100&fit=crop'
      },
      { 
        name: 'Es Teh Manis', 
        qty: 1, 
        price: 5000,
        image: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=100&h=100&fit=crop'
      },
      { 
        name: 'Mie Ayam', 
        qty: 2, 
        catatan: 'Pangsit', 
        price: 20000,
        image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=100&h=100&fit=crop'
      },
    ],
    waktuMulai: new Date(2026, 1, 28, 12, 30),
  },
  { 
    id: 2, 
    meja: 'Meja 12',
    status: 'order',
    items: [
      { 
        name: 'Mie Ayam', 
        qty: 2, 
        catatan: 'Pangsit', 
        price: 20000,
        image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=100&h=100&fit=crop'
      },
      { 
        name: 'Es Jeruk', 
        qty: 2, 
        price: 8000,
        image: 'https://images.unsplash.com/photo-1621265017611-23b2f3d2d1e8?w=100&h=100&fit=crop'
      }
    ],
    waktuMulai: new Date(2026, 1, 28, 12, 32),
  },
  { 
    id: 3, 
    meja: 'Meja 3',
    status: 'order',
    items: [
      { 
        name: 'Soto Ayam', 
        qty: 1, 
        price: 25000,
        image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=100&h=100&fit=crop'
      },
      { 
        name: 'Krupuk', 
        qty: 2, 
        price: 2000,
        image: 'https://images.unsplash.com/photo-1611364004717-9b5d5b5b5b5b?w=100&h=100&fit=crop'
      }
    ],
    waktuMulai: new Date(2026, 1, 28, 12, 35),
  },
  { 
    id: 4, 
    meja: 'Meja 19',
    status: 'order',
    items: [
      { 
        name: 'Bakso Urat', 
        qty: 3, 
        catatan: 'Pedas', 
        price: 30000,
        image: 'https://images.unsplash.com/photo-1625314897518-5bdf5217e22a?w=100&h=100&fit=crop'
      },
      { 
        name: 'Es Teh Tawar', 
        qty: 2, 
        price: 3000,
        image: 'https://images.unsplash.com/photo-1544787219-6f284303f1a9?w=100&h=100&fit=crop'
      }
    ],
    waktuMulai: new Date(2026, 1, 28, 12, 38),
  },
  { 
    id: 5, 
    meja: 'Meja 5',
    status: 'order',
    items: [
      { 
        name: 'Nasi Goreng Seafood', 
        qty: 1, 
        price: 35000,
        image: 'https://images.unsplash.com/photo-1644592655775-973c748e2c8f?w=100&h=100&fit=crop'
      },
      { 
        name: 'Jus Alpukat', 
        qty: 1, 
        price: 15000,
        image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=100&h=100&fit=crop'
      }
    ],
    waktuMulai: new Date(2026, 1, 28, 12, 40),
  },
  { 
    id: 6, 
    meja: 'Meja 15',
    status: 'order',
    items: [
      { 
        name: 'Mie Goreng', 
        qty: 2, 
        catatan: 'Telur', 
        price: 20000,
        image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=100&h=100&fit=crop'
      },
      { 
        name: 'Teh Botol', 
        qty: 2, 
        price: 7000,
        image: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=100&h=100&fit=crop'
      }
    ],
    waktuMulai: new Date(2026, 1, 28, 12, 42),
  },
  { 
    id: 7, 
    meja: 'Meja 9',
    status: 'order',
    items: [
      { 
        name: 'Ayam Goreng', 
        qty: 2, 
        price: 25000,
        image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=100&h=100&fit=crop'
      },
      { 
        name: 'Nasi Putih', 
        qty: 2, 
        price: 5000,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'
      }
    ],
    waktuMulai: new Date(2026, 1, 28, 12, 45),
  },

  // ========== STATUS: ANTAR (SIAP DIANTAR KE MEJA) ==========
  { 
    id: 8, 
    meja: 'Meja 2',
    status: 'antar',
    items: [
      { 
        name: 'Nasi Goreng', 
        qty: 1, 
        price: 25000,
        image: 'https://images.unsplash.com/photo-1644592655775-973c748e2c8f?w=100&h=100&fit=crop'
      },
      { 
        name: 'Es Teh Manis', 
        qty: 2, 
        price: 5000,
        image: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=100&h=100&fit=crop'
      }
    ],
    waktuMulai: new Date(2026, 1, 28, 12, 15),
  },
  { 
    id: 9, 
    meja: 'Meja 18',
    status: 'antar',
    items: [
      { 
        name: 'Mie Ayam', 
        qty: 2, 
        price: 20000,
        image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=100&h=100&fit=crop'
      },
      { 
        name: 'Pisang Goreng', 
        qty: 1, 
        price: 15000,
        image: 'https://images.unsplash.com/photo-1614849286521-4c58b2f0ff15?w=100&h=100&fit=crop'
      }
    ],
    waktuMulai: new Date(2026, 1, 28, 12, 18),
  },
  { 
    id: 10, 
    meja: 'Meja 6',
    status: 'antar',
    items: [
      { 
        name: 'Soto Ayam', 
        qty: 1, 
        price: 25000,
        image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=100&h=100&fit=crop'
      },
      { 
        name: 'Es Campur', 
        qty: 1, 
        price: 18000,
        image: 'https://images.unsplash.com/photo-1621265017611-23b2f3d2d1e8?w=100&h=100&fit=crop'
      }
    ],
    waktuMulai: new Date(2026, 1, 28, 12, 20),
  },
  { 
    id: 11, 
    meja: 'Meja 14',
    status: 'antar',
    items: [
      { 
        name: 'Bakso Urat', 
        qty: 2, 
        price: 30000,
        image: 'https://images.unsplash.com/photo-1625314897518-5bdf5217e22a?w=100&h=100&fit=crop'
      },
      { 
        name: 'Es Jeruk', 
        qty: 1, 
        price: 8000,
        image: 'https://images.unsplash.com/photo-1621265017611-23b2f3d2d1e8?w=100&h=100&fit=crop'
      }
    ],
    waktuMulai: new Date(2026, 1, 28, 12, 22),
  },
  { 
    id: 12, 
    meja: 'Meja 1',
    status: 'antar',
    items: [
      { 
        name: 'Nasi Goreng', 
        qty: 1, 
        price: 25000,
        image: 'https://images.unsplash.com/photo-1644592655775-973c748e2c8f?w=100&h=100&fit=crop'
      },
      { 
        name: 'Jus Alpukat', 
        qty: 1, 
        price: 15000,
        image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=100&h=100&fit=crop'
      },
      { 
        name: 'Pisang Goreng', 
        qty: 1, 
        price: 15000,
        image: 'https://images.unsplash.com/photo-1614849286521-4c58b2f0ff15?w=100&h=100&fit=crop'
      }
    ],
    waktuMulai: new Date(2026, 1, 28, 12, 25),
  },
  { 
    id: 13, 
    meja: 'Meja 11',
    status: 'antar',
    items: [
      { 
        name: 'Mie Goreng', 
        qty: 2, 
        price: 20000,
        image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=100&h=100&fit=crop'
      },
      { 
        name: 'Teh Botol', 
        qty: 1, 
        price: 7000,
        image: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=100&h=100&fit=crop'
      }
    ],
    waktuMulai: new Date(2026, 1, 28, 12, 28),
  },

  // ========== STATUS: SELESAI (SUDAH DIBAYAR) ==========
  { 
    id: 14, 
    meja: 'Meja 20',
    status: 'selesai',
    items: [
      { 
        name: 'Nasi Goreng', 
        qty: 3, 
        price: 25000,
        image: 'https://images.unsplash.com/photo-1644592655775-973c748e2c8f?w=100&h=100&fit=crop'
      },
      { 
        name: 'Es Teh Manis', 
        qty: 3, 
        price: 5000,
        image: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=100&h=100&fit=crop'
      }
    ],
    waktuMulai: new Date(2026, 1, 28, 11, 30),
    waktuSelesai: new Date(2026, 1, 28, 12, 10),
  },
  { 
    id: 15, 
    meja: 'Meja 4',
    status: 'selesai',
    items: [
      { 
        name: 'Mie Ayam', 
        qty: 2, 
        price: 20000,
        image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=100&h=100&fit=crop'
      },
      { 
        name: 'Pisang Goreng', 
        qty: 2, 
        price: 15000,
        image: 'https://images.unsplash.com/photo-1614849286521-4c58b2f0ff15?w=100&h=100&fit=crop'
      },
      { 
        name: 'Es Jeruk', 
        qty: 2, 
        price: 8000,
        image: 'https://images.unsplash.com/photo-1621265017611-23b2f3d2d1e8?w=100&h=100&fit=crop'
      }
    ],
    waktuMulai: new Date(2026, 1, 28, 11, 45),
    waktuSelesai: new Date(2026, 1, 28, 12, 20),
  },
  { 
    id: 16, 
    meja: 'Meja 13',
    status: 'selesai',
    items: [
      { 
        name: 'Soto Ayam', 
        qty: 2, 
        price: 25000,
        image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=100&h=100&fit=crop'
      },
      { 
        name: 'Krupuk', 
        qty: 4, 
        price: 2000,
        image: 'https://images.unsplash.com/photo-1611364004717-9b5d5b5b5b5b?w=100&h=100&fit=crop'
      }
    ],
    waktuMulai: new Date(2026, 1, 28, 11, 50),
    waktuSelesai: new Date(2026, 1, 28, 12, 25),
  },
  { 
    id: 17, 
    meja: 'Meja 8',
    status: 'selesai',
    items: [
      { 
        name: 'Bakso Urat', 
        qty: 2, 
        price: 30000,
        image: 'https://images.unsplash.com/photo-1625314897518-5bdf5217e22a?w=100&h=100&fit=crop'
      },
      { 
        name: 'Es Teh Tawar', 
        qty: 2, 
        price: 3000,
        image: 'https://images.unsplash.com/photo-1544787219-6f284303f1a9?w=100&h=100&fit=crop'
      }
    ],
    waktuMulai: new Date(2026, 1, 28, 11, 55),
    waktuSelesai: new Date(2026, 1, 28, 12, 30),
  },
  { 
    id: 18, 
    meja: 'Meja 16',
    status: 'selesai',
    items: [
      { 
        name: 'Nasi Goreng Seafood', 
        qty: 1, 
        price: 35000,
        image: 'https://images.unsplash.com/photo-1644592655775-973c748e2c8f?w=100&h=100&fit=crop'
      },
      { 
        name: 'Jus Alpukat', 
        qty: 1, 
        price: 15000,
        image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=100&h=100&fit=crop'
      },
      { 
        name: 'Pisang Goreng', 
        qty: 1, 
        price: 15000,
        image: 'https://images.unsplash.com/photo-1614849286521-4c58b2f0ff15?w=100&h=100&fit=crop'
      }
    ],
    waktuMulai: new Date(2026, 1, 28, 12, 11),
    waktuSelesai: new Date(2026, 1, 28, 12, 35),
  },
  { 
    id: 19, 
    meja: 'Meja 10',
    status: 'selesai',
    items: [
      { 
        name: 'Mie Goreng', 
        qty: 2, 
        price: 20000,
        image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=100&h=100&fit=crop'
      },
      { 
        name: 'Teh Botol', 
        qty: 2, 
        price: 7000,
        image: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=100&h=100&fit=crop'
      }
    ],
    waktuMulai: new Date(2026, 1, 28, 12, 23),
    waktuSelesai: new Date(2026, 1, 28, 12, 40),
  },
  { 
    id: 20, 
    meja: 'Meja 17',
    status: 'selesai',
    items: [
      { 
        name: 'Ayam Goreng', 
        qty: 2, 
        price: 25000,
        image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=100&h=100&fit=crop'
      },
      { 
        name: 'Nasi Putih', 
        qty: 2, 
        price: 5000,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'
      }
    ],
    waktuMulai: new Date(2026, 1, 28, 12, 10),
    waktuSelesai: new Date(2026, 1, 28, 12, 45),
  }
])

  const cookingOrders = computed(() => orders.value.filter(order => order.status === 'order'))
  const cashierOrders = computed(() => orders.value.filter(order =>['order', 'antar'].includes(order.status)))
  const completedOrders = computed(() => orders.value.filter(order => order.status === 'selesai'))

//   ===action===   
    function updateOrderStatus(orderId, newStatus) {
        const order = orders.value.find(order => order.id === orderId)
        if(order){
             console.log(`🔄 Order #${orderId} (${order.meja}): ${order.status} → ${newStatus}`)
             order.status = newStatus
              if (newStatus === 'selesai') {
                    order.waktuSelesai = new Date()
                }
        }
    }
    function sendOrderToKitchen(orderId){
        updateOrderStatus(orderId,'order')
    }
    function sendOrder(orderId){
        updateOrderStatus(orderId,'antar')
    }
    function markAsPaid(orderId){
        updateOrderStatus(orderId,'selesai')
    }
    function addOrder(newOrder) {
    const newId = Math.max(...orders.value.map(o => o.id), 0) + 1
    orders.value.push({
      id: newId,
      ...newOrder,
      status: 'order',
      waktuMulai: new Date()
    })
    console.log(`✅ Order baru #${newId} ditambahkan`)
  }

  async function fetchOrder() {
    // Nanti ganti dengan: const response = await api.get('/tables')
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(orders.value)
      }, 500) // Simulasi loading 500ms
    })
  }
  return {
    // state
    orders,
    // getters
    cookingOrders,
    cashierOrders,
    completedOrders,
    // actions
    updateOrderStatus,
    fetchOrder,
    UpdateOrderStatus: updateOrderStatus,
    sendOrderToKitchen,
    sendOrder,
    markAsPaid,
    addOrder
  }
})
