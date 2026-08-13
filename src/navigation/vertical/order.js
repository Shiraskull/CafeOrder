export default [
  {
    title: 'Order',
    icon: { icon: 'tabler-clipboard-text' },
    children: [
      {
        title: 'List Order',
        to: 'order',
      },
      {
        title: 'List Table',
        to: 'table-layout',
      },
      {
        title: 'Cooking',
        to: 'cooking',
      },
      {
        title: 'History',
        to: 'order-history',
      },
    ],
    // badgeContent: '5',
    badgeClass: 'bg-error',
  },
   {
    title: 'Items',
    to: 'items',
    icon: { icon: 'tabler-tools-kitchen' },
  }
]
