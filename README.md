# 🎡 YT Roulette

A clean, minimalistic React application to randomly "roll the dice" and pick a video from any YouTube channel or playlist. Perfect for "lazy viewing" and discovering forgotten gems or the most popular hits from your favorite creators.

![YT Roulette Screenshot Placeholder](https://via.placeholder.com/1200x600?text=YT+Roulette+Screenshot)

## 🚀 Features

-   **Smart Channel Parsing**: Input a full URL, a `@handle`, or a raw Channel ID—it just works.
-   **Dual Search Strategy**:
    -   **Most Recent**: Pick from the 50 newest uploads.
    -   **Most Popular**: Leverages the YouTube Search API to find the top 50 performing videos of all time (or for a specific timeframe).
-   **Timeframe Filters**: Narrow down your roulette to the **Last Month**, **Last Year**, **Last 5 Years**, or **Any Time**.
-   **Native Experience**: Uses the standard YouTube iframe player with built-in thumbnails and controls.
-   **Total Fallback Logic**: The app is designed to **always** find a video. If your timeframe is too narrow, it automatically widens the search until a video is found.

## 🛠️ Tech Stack

-   **Framework**: [React](https://reactjs.org/) (with [Vite](https://vitejs.dev/))
-   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Date Handling**: [date-fns](https://date-fns.org/)
-   **API**: [YouTube Data API v3](https://developers.google.com/youtube/v3)

## 📦 Setup & Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/YT-Roulette.git
    cd YT-Roulette
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a `.env` file in the root directory and add your YouTube API Key:
    ```env
    VITE_YOUTUBE_API_KEY=your_api_key_here
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## 🌐 Deployment (Vercel/Netlify)

1.  **Push to GitHub**: Connect your repository to Vercel or Netlify.
2.  **Add Environment Variable**: In the dashboard, add `VITE_YOUTUBE_API_KEY` under the "Environment Variables" section.
3.  **Build Command**: `npm run build`
4.  **Output Directory**: `dist`

### ⚠️ Security Note
Since this is a client-side app, your API key will be visible in the browser's network tab. **You MUST restrict your API key** in the Google Cloud Console to only work on your deployed domain (e.g., `https://your-app.vercel.app/*`).

## 📜 License
MIT License. Feel free to use and remix!
