const fs = require('fs');
let content = fs.readFileSync('src/screens/OrderDelivery/index.js', 'utf8');

if (!content.includes('useTheme')) {
  content = content.replace('import { useAuth } from "../../contexts/AuthContext";', 'import { useAuth } from "../../contexts/AuthContext";\nimport { useTheme } from "../../contexts/ThemeContext";');
}

if (!content.includes('const { colors, isDark } = useTheme();')) {
  content = content.replace('const OrderDelivery = ({ navigation, route }) => {', 'const OrderDelivery = ({ navigation, route }) => {\n  const { colors, isDark } = useTheme();\n  const styles = getStyles(colors, isDark);');
}

// Convert StyleSheet.create to getStyles function
content = content.replace(/const styles = StyleSheet\.create\(\{/, 'const getStyles = (colors, isDark) => StyleSheet.create({');

// Replaces colors in the styles block (mostly relying on standard replacements)
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
content = content.replace(/'#F1F5F9'/gi, 'colors.border');
content = content.replace(/'#475569'/gi, 'colors.textSecondary');
content = content.replace(/'#0F172A'/gi, 'colors.text');
content = content.replace(/'#334155'/gi, 'colors.textSecondary');
content = content.replace(/'#94A3B8'/gi, 'colors.textMuted');

// Handle specific elements in OrderDelivery render
content = content.replace(/color="#111C44"/gi, 'color={colors.text}');
content = content.replace(/color="#6B7280"/gi, 'color={colors.textSecondary}');
content = content.replace(/color="#0EA5E9"/gi, 'color={colors.primary}');
content = content.replace(/color="#374151"/gi, 'color={colors.text}');

fs.writeFileSync('src/screens/OrderDelivery/index.js', content);
