module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        body: ['Barlow', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        form: {
          label: '#94a3b8', // slate-400
          inputBg: '#ffffff',
          inputBorder: '#e6edf3', // slate-200
          placeholder: '#94a3b8',
          primary: '#06b6d4', // cyan-400
        },
      },
    },
  },
  plugins: [],
}