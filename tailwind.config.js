/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#FFD700",
                    hover: "#E5C100",
                    foreground: "#000000"
                },
                secondary: {
                    DEFAULT: "#1C1C1E",
                    foreground: "#FFFFFF"
                },
                background: "#000000",
                foreground: "#FFFFFF",
                muted: "#2C2C2E",
                accent: "#FFD700",
                destructive: "#EF4444",
                success: "#10B981"
            }
        },
    },
    plugins: [],
}
