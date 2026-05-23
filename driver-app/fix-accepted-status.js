const fs = require('fs');
let content = fs.readFileSync('src/screens/OrderDelivery/index.js', 'utf8');

const target = `    switch (orderStatus) {
      case 'preparing':`;
const replacement = `    switch (orderStatus) {
      case 'pending':
      case 'accepted':
      case 'preparing':`;

content = content.replace(target, replacement);

fs.writeFileSync('src/screens/OrderDelivery/index.js', content);
