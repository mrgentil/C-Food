@php
    $globalSettings = \App\Models\Setting::whereIn('key', ['app_logo', 'primary_color'])->pluck('value', 'key');
    $primaryColor = $globalSettings['primary_color'] ?? '#EB1700'; // DoorDash Red par défaut
@endphp
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{{ asset('css/admin.css') }}?v=4">
<script>
    tailwind.config = {
        darkMode: 'class', // We will force dark mode
        theme: {
            extend: {
                fontFamily: {
                    sans: ['Inter', 'system-ui', 'sans-serif'],
                },
                colors: {
                    brand: {
                        50: '#e0f2fe',
                        100: '#bae6fd',
                        200: '#7dd3fc',
                        300: '#38bdf8',
                        400: '#0ea5e9', // C-Food Blue
                        500: '#0284c7', // Darker Blue
                        600: '#0369a1',
                        700: '#075985',
                        800: '#0c4a6e',
                        900: '#082f49',
                    },
                    dark: {
                        bg: '#000000',
                        card: '#1c1c1e',
                        border: '#2c2c2e',
                        text: '#ffffff',
                        muted: '#a1a1aa'
                    }
                },
                boxShadow: {
                    soft: '0 4px 20px rgba(0, 0, 0, 0.4)',
                    card: '0 8px 30px rgba(0, 0, 0, 0.5)',
                },
            },
        },
    };
</script>
<style>
    .sidebar { transition: width 0.25s ease; }
    
    /* Custom Scrollbar for a premium feel */
    ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }
    ::-webkit-scrollbar-track {
        background: transparent; 
    }
    ::-webkit-scrollbar-thumb {
        background: #cbd5e1; 
        border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
        background: #94a3b8; 
    }
</style>
