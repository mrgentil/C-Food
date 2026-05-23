const fs = require('fs');
let content = fs.readFileSync('app/Http/Controllers/Api/AdminController.php', 'utf8');

// 1. Add use App\Events\OrderAvailable;
if (!content.includes('use App\\Events\\OrderAvailable;')) {
    content = content.replace('use App\\Models\\Order;', 'use App\\Models\\Order;\nuse App\\Events\\OrderAvailable;');
}

// 2. Add broadcast to updateOrderStatus
const target1 = `        OrderPayment::syncPaidAt($order);
        $order->save();

        // Notify customer (best-effort)`;
const replacement1 = `        OrderPayment::syncPaidAt($order);
        $order->save();

        if ($validated['status'] === 'preparing' && empty($order->driver_id)) {
            broadcast(new OrderAvailable($order));
        }

        // Notify customer (best-effort)`;
if (!content.includes("broadcast(new OrderAvailable($order));")) {
    content = content.replace(target1, replacement1);
}

// 3. Add broadcast to webUpdateOrderStatus
const target2 = `        if ($validated['status'] === 'delivered') {
            OrderPayment::markCashCollected($order);
        }
        OrderPayment::syncPaidAt($order);
        $order->save();

        return back()->with('success', 'Statut de la commande mis à jour.');`;
const replacement2 = `        if ($validated['status'] === 'delivered') {
            OrderPayment::markCashCollected($order);
        }
        OrderPayment::syncPaidAt($order);
        $order->save();

        if ($validated['status'] === 'preparing' && empty($order->driver_id)) {
            broadcast(new OrderAvailable($order));
        }

        return back()->with('success', 'Statut de la commande mis à jour.');`;

if (content.includes("return back()->with('success', 'Statut de la commande mis à jour.');") && !content.includes("broadcast(new OrderAvailable($order));\n\n        return back()->with('success', 'Statut de la commande mis à jour.');")) {
    content = content.replace(target2, replacement2);
}

fs.writeFileSync('app/Http/Controllers/Api/AdminController.php', content);
