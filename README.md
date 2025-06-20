# 🌿 FloraFind

FloraFind is an AI-powered plant identification application that helps users discover and learn about the flora around them. Built with modern web technologies, it offers a seamless experience for plant enthusiasts, gardeners, and nature lovers.

## ✨ Features

- 📸 **Instant Plant Identification**: Take a photo or upload an image to identify plants in real-time
- 🎨 **Beautiful UI/UX**: Modern, responsive design with smooth animations and transitions
- 🌙 **Dark/Light Mode**: Seamless theme switching for comfortable viewing
- 📱 **Mobile-First**: Optimized for both mobile and desktop experiences
- 🔐 **Secure Authentication**: Email/password and Google OAuth integration
- 🗃️ **Personal Garden**: Save and organize your identified plants
- 🤖 **AI-Powered**: Advanced plant recognition using state-of-the-art AI models

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/)
- **Authentication**: [Supabase Auth](https://supabase.com/auth)
- **Database**: [Supabase](https://supabase.com/)
- **AI Integration**: [GenKit AI](https://genkit.ai/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/)
- **Type Safety**: [TypeScript](https://www.typescriptlang.org/)

## 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ScreenSlauth/FloraFind.git
   cd FloraFind
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with the following variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GENKIT_API_KEY=your_genkit_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

   The application will be available at [http://localhost:9002](http://localhost:9002)

## 📦 Build

To create a production build:

```bash
npm run build
npm start
```

## 🧪 Development

- `npm run dev` - Start development server with Turbopack
- `npm run dev:clean` - Start fresh development server
- `npm run genkit:dev` - Start GenKit AI development
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint

## 🌐 Browser Support

FloraFind supports all modern browsers:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## 📱 Mobile Features

- Camera integration for instant plant photos
- Image compression for optimal performance
- Responsive design for all screen sizes
- Touch-friendly interface
- Progressive Web App (PWA) capabilities

## 🔒 Security Features

- Secure authentication flow
- Protected API routes
- Input validation and sanitization
- File upload restrictions and validation
- Secure session management

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Plant identification powered by GenKit AI
- UI components from shadcn/ui
- Icons from Lucide React
- Fonts from Google Fonts

---

<p align="center">Made with 💚 by <a href="https://github.com/ScreenSlauth">ScreenSlauth</a></p>
