import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/EscapeRoomBayside/', // <-- ADD THIS (Replace with your exact repo name)
  plugins: [react(), tailwindcss()],
});