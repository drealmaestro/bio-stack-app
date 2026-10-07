/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Space Grotesk', 'sans-serif'],
                display: ['Barlow Condensed', 'sans-serif'],
                headline: ['Barlow Condensed', 'sans-serif'],
                body: ['Space Grotesk', 'sans-serif'],
            },
            colors: {
                primary: {
                    DEFAULT: "#ccff00",
                    hover: "#b3e600",
                    foreground: "#0d0f12"
                },
                secondary: {
                    DEFAULT: "#282a2d",
                    foreground: "#e2e2e6"
                },
                background: "#111317",
                foreground: "#e2e2e6",
                surface: {
                    DEFAULT: "#1e2023",
                    high: "#282a2d",
                    highest: "#333538",
                    low: "#1a1c1f",
                },
                muted: "#282a2d",
                accent: "#ccff00",
                destructive: "#ff3b30",
                success: "#ccff00"
            }
        },
    },
    plugins: [],
}
