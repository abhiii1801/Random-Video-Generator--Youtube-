# 🎡 YT Roulette

A clean, minimalistic React application to randomly "roll the dice" and pick a video from any YouTube channel or playlist. Perfect for "lazy viewing" and discovering forgotten gems or the most popular hits from your favorite creators.

Try it here: https://youtube-roulette.vercel.app/

<img width="1332" height="831" alt="image" src="https://github.com/user-attachments/assets/ec8ca8bb-4442-4b8e-a1f8-e5884406e65d" />


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
