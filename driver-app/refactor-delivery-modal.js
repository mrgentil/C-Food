const fs = require('fs');
let content = fs.readFileSync('src/screens/OrderDelivery/index.js', 'utf8');

// 1. Add import
if (!content.includes('DeliverySuccessModal')) {
  content = content.replace('import { DriverOrderReceipt } from "../../components/DriverOrderReceipt";', 'import { DriverOrderReceipt } from "../../components/DriverOrderReceipt";\nimport DeliverySuccessModal from "../../components/DeliverySuccessModal";');
}

// 2. Add state
if (!content.includes('const [showSuccessModal, setShowSuccessModal] = useState(false);')) {
  content = content.replace('const [receiptLoading, setReceiptLoading] = useState(', 'const [showSuccessModal, setShowSuccessModal] = useState(false);\n  const [receiptLoading, setReceiptLoading] = useState(');
}

// 3. Update the handleMainAction logic to show modal instead of Alert
// In the confirmation dialog for delivered:
// We look for:
/*
                      {
                        text: "Confirmer",
                        onPress: async () => {
                          await updateOrderStatus("delivered", { cashCollected: true });
                          Alert.alert(
                            "Bravo !",
                            "Livraison et encaissement enregistrés.",
                            [{ text: "OK", onPress: () => navigation.goBack() }]
                          );
                        },
                      },
*/
const cashConfirmBlock = `                        text: "Confirmer",
                        onPress: async () => {
                          await updateOrderStatus("delivered", { cashCollected: true });
                          Alert.alert(
                            "Bravo !",
                            "Livraison et encaissement enregistrés.",
                            [{ text: "OK", onPress: () => navigation.goBack() }]
                          );
                        },`;
const cashConfirmBlockNew = `                        text: "Confirmer",
                        onPress: async () => {
                          await updateOrderStatus("delivered", { cashCollected: true });
                          setShowSuccessModal(true);
                        },`;
content = content.replace(cashConfirmBlock, cashConfirmBlockNew);
// Note: due to unicode chars in "enregistrés" vs "enregistrǸs" etc., let's use regex.

content = content.replace(/await updateOrderStatus\("delivered"(, \{ cashCollected: true \})?\);\s*Alert\.alert\(\s*"Bravo !"[^\]]*\]\s*\);/g, (match, p1) => {
    if (p1) {
        return `await updateOrderStatus("delivered", { cashCollected: true });\n                          setShowSuccessModal(true);`;
    }
    return `await updateOrderStatus("delivered");\n                  setShowSuccessModal(true);`;
});

// 4. Add the modal before the closing SafeAreaView tag
if (!content.includes('<DeliverySuccessModal')) {
  const modalJSX = `
      <DeliverySuccessModal 
        visible={showSuccessModal} 
        onClose={() => {
            setShowSuccessModal(false);
            navigation.goBack();
        }}
        orderTotal={order?.total}
        colors={colors}
        isDark={isDark}
      />
    </SafeAreaView>`;
  content = content.replace('</SafeAreaView>', modalJSX);
}

fs.writeFileSync('src/screens/OrderDelivery/index.js', content);
