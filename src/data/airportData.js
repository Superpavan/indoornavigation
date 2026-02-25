// src/data/airportData.js
// All map data for the airport terminal simulation

export const NAV_NODES = [
  { id: 1,  x: 120, y: 80,  label: 'Gate A1' },
  { id: 2,  x: 320, y: 80,  label: 'Gate A2' },
  { id: 3,  x: 520, y: 80,  label: 'Gate A3' },
  { id: 4,  x: 720, y: 80,  label: 'Gate A4' },
  { id: 5,  x: 120, y: 220, label: 'Junction N1' },
  { id: 6,  x: 320, y: 220, label: 'Junction N2' },
  { id: 7,  x: 520, y: 220, label: 'Junction N3' },
  { id: 8,  x: 720, y: 220, label: 'Junction N4' },
  { id: 9,  x: 120, y: 380, label: 'Junction M1' },
  { id: 10, x: 320, y: 380, label: 'Junction M2' },
  { id: 11, x: 520, y: 380, label: 'Junction M3' },
  { id: 12, x: 720, y: 380, label: 'Junction M4' },
  { id: 13, x: 120, y: 540, label: 'Junction S1' },
  { id: 14, x: 320, y: 540, label: 'Junction S2' },
  { id: 15, x: 520, y: 540, label: 'Junction S3' },
  { id: 16, x: 720, y: 540, label: 'Junction S4' },
  { id: 17, x: 120, y: 700, label: 'Gate B1' },
  { id: 18, x: 320, y: 700, label: 'Gate B2' },
  { id: 19, x: 520, y: 700, label: 'Gate B3' },
  { id: 20, x: 720, y: 700, label: 'Gate B4' },
  { id: 21, x: 860, y: 380, label: 'Gate 31' },
  { id: 99, x: 980, y: 100, label: 'Outside Zone', outsideBoundary: true },
];

export const NAV_EDGES = [
  { from: 1,  to: 2  }, { from: 2,  to: 3  }, { from: 3,  to: 4  },
  { from: 5,  to: 6  }, { from: 6,  to: 7  }, { from: 7,  to: 8  },
  { from: 9,  to: 10 }, { from: 10, to: 11 }, { from: 11, to: 12 },
  { from: 13, to: 14 }, { from: 14, to: 15 }, { from: 15, to: 16 },
  { from: 17, to: 18 }, { from: 18, to: 19 }, { from: 19, to: 20 },
  { from: 1,  to: 5  }, { from: 5,  to: 9  }, { from: 9,  to: 13 }, { from: 13, to: 17 },
  { from: 2,  to: 6  }, { from: 6,  to: 10 }, { from: 10, to: 14 }, { from: 14, to: 18 },
  { from: 3,  to: 7  }, { from: 7,  to: 11 }, { from: 11, to: 15 }, { from: 15, to: 19 },
  { from: 4,  to: 8  }, { from: 8,  to: 12 }, { from: 12, to: 16 }, { from: 16, to: 20 },
  { from: 12, to: 21 }, { from: 16, to: 21 },
  { from: 4,  to: 99 },
];

export const SERVICES = [
  { id: 's1',  type: 'restroom', x: 80,  y: 210, label: 'Restrooms A',    nearNode: 5  },
  { id: 's2',  type: 'restroom', x: 80,  y: 370, label: 'Restrooms B',    nearNode: 9  },
  { id: 's3',  type: 'restroom', x: 80,  y: 530, label: 'Restrooms C',    nearNode: 13 },
  { id: 's4',  type: 'restroom', x: 490, y: 670, label: 'Restrooms D',    nearNode: 19 },
  { id: 's5',  type: 'restroom', x: 80,  y: 690, label: 'Restrooms E',    nearNode: 17 },
  { id: 's6',  type: 'food',     x: 520, y: 200, label: 'Dining Express', nearNode: 7  },
  { id: 's7',  type: 'food',     x: 720, y: 200, label: 'Cafe Central',   nearNode: 8  },
  { id: 's8',  type: 'food',     x: 520, y: 370, label: 'Dining Plaza',   nearNode: 11 },
  { id: 's9',  type: 'food',     x: 320, y: 620, label: 'Dining South',   nearNode: 14 },
  { id: 's10', type: 'food',     x: 480, y: 560, label: 'Cafe Corner',    nearNode: 15 },
  { id: 's11', type: 'food',     x: 620, y: 560, label: 'Cafe Plus',      nearNode: 16 },
  { id: 's12', type: 'shopping', x: 80,  y: 610, label: 'Retail Shops A', nearNode: 13 },
  { id: 's13', type: 'shopping', x: 440, y: 560, label: 'Retail Shops B', nearNode: 15 },
  { id: 's14', type: 'shopping', x: 730, y: 560, label: 'News & More',    nearNode: 16 },
  { id: 's15', type: 'shopping', x: 580, y: 680, label: 'News Stand',     nearNode: 19 },
  { id: 's16', type: 'shopping', x: 770, y: 680, label: 'Baggage Claim',  nearNode: 20 },
  { id: 's17', type: 'lounge',   x: 320, y: 170, label: 'Lounge A',       nearNode: 6  },
  { id: 's18', type: 'lounge',   x: 320, y: 350, label: 'Lounge B',       nearNode: 10 },
  { id: 's19', type: 'lounge',   x: 320, y: 545, label: 'Lounge C',       nearNode: 14 },
  { id: 's20', type: 'helpdesk', x: 420, y: 80,  label: 'Help Desk',      nearNode: 3  },
  { id: 's21', type: 'helpdesk', x: 420, y: 700, label: 'Info Center',    nearNode: 19 },
];

export const SERVICE_CATEGORIES = {
  restroom: { label: 'Restrooms', icon: '🚻', color: '#1E4D9A', bg: '#E8F0FE' },
  food:     { label: 'Food',      icon: '🍽️', color: '#B45309', bg: '#FEF3C7' },
  shopping: { label: 'Shopping',  icon: '🛍️', color: '#9333EA', bg: '#F5F3FF' },
  lounge:   { label: 'Lounges',   icon: '🛋️', color: '#0F766E', bg: '#CCFBF1' },
  helpdesk: { label: 'Help Desk', icon: '❓', color: '#DC2626', bg: '#FEF2F2' },
};

export const BOUNDARY = [
  { x: 30,  y: 30  },
  { x: 900, y: 30  },
  { x: 900, y: 760 },
  { x: 30,  y: 760 },
];

export const BEACONS = [
  { id: 'b1', nodeId: 1,  x: 120, y: 80,  txPower: -59, label: 'B1' },
  { id: 'b2', nodeId: 6,  x: 320, y: 220, txPower: -59, label: 'B2' },
  { id: 'b3', nodeId: 11, x: 520, y: 380, txPower: -59, label: 'B3' },
  { id: 'b4', nodeId: 16, x: 720, y: 540, txPower: -59, label: 'B4' },
  { id: 'b5', nodeId: 21, x: 860, y: 380, txPower: -59, label: 'B5' },
];

export const WORLD = { width: 950, height: 800 };

export function worldToSVG(wx, wy) {
  return { x: wx, y: wy };
}

export function isInsideBoundary(px, py) {
  const poly = BOUNDARY;
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y;
    const xj = poly[j].x, yj = poly[j].y;
    const intersect =
      yi > py !== yj > py &&
      px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function nearestNavNode(wx, wy) {
  return NAV_NODES.reduce((best, n) => {
    const d = Math.hypot(n.x - wx, n.y - wy);
    return d < best.d ? { node: n, d } : best;
  }, { node: null, d: Infinity }).node;
}

export const FLIGHT_INFO = {
  flightNo:   'DJENGO',
  from:       'DXB',
  to:         'LND',
  status:     'ON TIME',
  departure:  '17:15',
  gate:       '31',
  gateNodeId: 21,
  passenger:  'JANE DOE',
  seat:       '27B',
  class:      'FIRST',
  boarding:   '05:20 PM',
};