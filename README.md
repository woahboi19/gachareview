# GachaReview 🌟

GachaReview is a comprehensive story database and review platform dedicated to popular Gacha games (like Genshin Impact, Honkai: Star Rail, and Zenless Zone Zero). 

The platform allows players to catch up on story summaries, track chapters, and share their reviews and ratings for individual story arcs with the community.

## 🚀 Features

- **Story Database:** Complete, categorized archive of story chapters, arcs, and missions across multiple Gacha titles.
- **Community Reviews & Ratings:** Users can write reviews, leave a star rating, and upvote helpful community reviews.
- **Spoiler Protection:** Built-in spoiler blur for reviews to protect players who haven't completed the story yet.
- **Personalized Profiles:** Users can track their favorite games, view their past reviews, and customize their display name and avatar.
- **Dynamic Auto-Translation:** One-click translation for user reviews, seamlessly adapting to the user's browser language.
- **Cinematic UI:** Beautiful glassmorphism design with a toggleable Dark / Light theme.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Database ORM:** [Prisma](https://www.prisma.io/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) (Discord & Google OAuth)
- **Styling:** Vanilla CSS with CSS Variables for dynamic theming
- **Translation API:** google-translate-api-x

## 💻 Getting Started Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/gachareview.git
   cd gachareview
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory and add the following:
   ```env
   # PostgreSQL / Supabase
   DATABASE_URL="postgresql://user:password@host:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://user:password@host:5432/postgres"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   AUTH_SECRET="your_super_secret_string"

   # Discord OAuth
   DISCORD_CLIENT_ID="your_discord_id"
   DISCORD_CLIENT_SECRET="your_discord_secret"
   ```

4. **Initialize Database**
   ```bash
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📦 Deployment
This project is fully optimized to be deployed on **Vercel**. 
*Note: If deploying to a serverless environment like Vercel, ensure you switch the Prisma database provider from `sqlite` to `postgresql` (e.g., using Supabase or Neon).*
