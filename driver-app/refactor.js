const fs = require('fs');
let content = fs.readFileSync('src/screens/OrdersScreen/index.js', 'utf8');

if (!content.includes('useTheme')) {
  content = content.replace('import { useAuth } from "../../contexts/AuthContext";', 'import { useAuth } from "../../contexts/AuthContext";\nimport { useTheme } from "../../contexts/ThemeContext";');
}

if (!content.includes('const { colors, isDark } = useTheme();')) {
  content = content.replace('const OrdersScreen = ({ navigation }) => {', 'const OrdersScreen = ({ navigation }) => {\n  const { colors, isDark } = useTheme();\n  const styles = getStyles(colors, isDark);');
}

content = content.replace(/const OrderCard = \(\{ order, driverProfile, handleAcceptOrder, rejectOrder, isOffline \}\) => \{/, 'const OrderCard = ({ order, driverProfile, handleAcceptOrder, rejectOrder, isOffline, colors, isDark, styles }) => {');

// Fix OrderCard usage (React component closing tag can be weirdly spaced)
// Replace any <OrderCard ... /> with adding colors, isDark, styles
content = content.replace(/<OrderCard[^>]*\/>/g, (match) => {
    if(match.includes('colors={colors}')) return match;
    return match.replace('/>', ' colors={colors} isDark={isDark} styles={styles} />');
});

content = content.replace(/const styles = StyleSheet\.create\(\{/, 'const getStyles = (colors, isDark) => StyleSheet.create({');
content = content.replace(/'#F4F7FE'/gi, 'colors.background');
content = content.replace(/'#111C44'/gi, 'colors.text');
content = content.replace(/'#6B7280'/gi, 'colors.textSecondary');
content = content.replace(/backgroundColor:\s*'#fff'/gi, 'backgroundColor: colors.surface');
content = content.replace(/backgroundColor:\s*'white'/gi, 'backgroundColor: colors.surface');
content = content.replace(/color:\s*'white'/gi, 'color: colors.textInverse');
content = content.replace(/color:\s*'#fff'/gi, 'color: colors.textInverse');
content = content.replace(/'#1F2937'/gi, 'colors.text');
content = content.replace(/'#374151'/gi, 'colors.text');
content = content.replace(/'#9CA3AF'/gi, 'colors.textMuted');
content = content.replace(/'#F3F4F6'/gi, 'colors.border');
content = content.replace(/'#0EA5E9'/gi, 'colors.primary');

fs.writeFileSync('src/screens/OrdersScreen/index.js', content);
