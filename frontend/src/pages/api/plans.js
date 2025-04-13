// pages/api/plans.js

export default function handler(req, res) {
    const plans = [
      {
        id: 'plan1',
        name: '1 Hour Access',
        price: 10,
        duration: '1h',
      },
      {
        id: 'plan2',
        name: 'Daily Access',
        price: 30,
        duration: '24h',
      },
      {
        id: 'plan3',
        name: 'Weekly Access',
        price: 100,
        duration: '7d',
      },
    ];
  
    res.status(200).json(plans);
  }
  