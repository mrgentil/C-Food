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
        theme: {
            extend: {
                fontFamily: {
                    sans: ['Inter', 'system-ui', 'sans-serif'],
                },
                colors: {
                    brand: {
                        50: '#FDE8E5',
                        100: '#FBD2CC',
                        200: '#F8A599',
                        300: '#F47766',
                        400: '#F14A33',
                        500: '{{ $primaryColor }}',
                        600: '#D11500',
                        700: '#B81200',
                        800: '#9E0F00',
                        900: '#850D00',
                    },
                },
                boxShadow: {
                    soft: '0 2px 10px rgba(0, 0, 0, 0.05)',
                    card: '0 4px 12px rgba(0, 0, 0, 0.08)',
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
